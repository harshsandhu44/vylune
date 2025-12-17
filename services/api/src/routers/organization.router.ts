import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { requireOrganization, requireLeader } from '../middleware/organization.middleware';
import type { Organization } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const organizationRouter = t.router({
  // Get organization by ID
  get: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<Organization> => {
      await requireOrganization(ctx);

      const organization = await ctx.models.Organization.get({ id: input.organizationId });

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      return organization as Organization;
    }),

  // Create organization (with trial)
  create: t.procedure
    .input(z.object({ name: z.string().min(2) }))
    .mutation(async ({ ctx, input }): Promise<Organization> => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const now = Date.now();
      const trialEndDate = now + 7 * 24 * 60 * 60 * 1000; // 7 days

      const organization = await ctx.models.Organization.create({
        name: input.name,
        leaderId: ctx.userId,
        subscriptionStatus: 'trial',
        trialStartDate: now,
        trialEndDate,
        seatCount: 5,
        baseSeatCount: 5,
        additionalSeats: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Create membership
      await ctx.models.OrganizationMember.create({
        organizationId: organization.id,
        userId: ctx.userId,
        role: 'leader',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });

      return organization as Organization;
    }),

  // Update organization
  update: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), name: z.string().min(2) }))
    .mutation(async ({ ctx, input }): Promise<Organization> => {
      await requireLeader(ctx);

      const organization = await ctx.models.Organization.update(
        { id: input.organizationId },
        { name: input.name, updatedAt: Date.now() }
      );

      return organization as Organization;
    }),

  // Get subscription status
  getSubscriptionStatus: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireOrganization(ctx);

      const organization = await ctx.models.Organization.get({ id: input.organizationId });

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      const daysRemaining =
        organization.subscriptionStatus === 'trial'
          ? Math.ceil((organization.trialEndDate - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;

      return {
        ...organization,
        daysRemaining,
      };
    }),

  // Get seat usage
  getSeatUsage: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireOrganization(ctx);

      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });

      const activeMembers = members.filter((m: any) => m.status === 'active').length;
      const organization = await ctx.models.Organization.get({ id: input.organizationId });

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      return {
        used: activeMembers,
        total: organization.seatCount,
        available: organization.seatCount - activeMembers,
      };
    }),

  // Transfer leadership
  transferLeadership: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), newLeaderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireLeader(ctx);

      // Verify new leader is an active member
      const newLeaderMembership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: input.newLeaderId,
      });

      if (!newLeaderMembership || newLeaderMembership.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New leader must be an active member',
        });
      }

      // Update organization
      await ctx.models.Organization.update(
        { id: input.organizationId },
        { leaderId: input.newLeaderId, updatedAt: Date.now() }
      );

      // Update old leader to member
      await ctx.models.OrganizationMember.update(
        { organizationId: input.organizationId, userId: ctx.userId },
        { role: 'member', updatedAt: Date.now() }
      );

      // Update new leader
      await ctx.models.OrganizationMember.update(
        { organizationId: input.organizationId, userId: input.newLeaderId },
        { role: 'leader', updatedAt: Date.now() }
      );

      return { success: true };
    }),
});
