import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { requireOrganization, requireLeader } from '../middleware/organization.middleware';
import type { OrganizationMember } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const memberRouter = t.router({
  // Invite member
  invite: t.procedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['member']),
      })
    )
    .mutation(async ({ ctx, input }): Promise<{ message: string }> => {
      await requireLeader(ctx);

      // Check seat availability
      const organization = await ctx.models.Organization.get({ id: input.organizationId });
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });
      const activeMembers = members.filter((m: any) => m.status === 'active').length;

      if (activeMembers >= organization.seatCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All seats are in use. Please add more seats to invite new members.',
        });
      }

      // Find user by email
      const users = await ctx.models.User.find({ gs1pk: 'USERS' }, { index: 'gs1' });
      const user = users.find((u: any) => u.email === input.email);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. The user must sign up first.',
        });
      }

      // Check if user is already a member
      const existingMembership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: user.id,
      });

      if (existingMembership) {
        if (existingMembership.status === 'active') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User is already a member of this organization',
          });
        }
        if (existingMembership.status === 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User already has a pending invitation',
          });
        }
      }

      // Create invitation
      const now = Date.now();
      await ctx.models.OrganizationMember.create({
        organizationId: input.organizationId,
        userId: user.id,
        role: input.role,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });

      // TODO: Send email invitation

      return { message: 'Invitation sent successfully' };
    }),

  // Remove member
  remove: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      await requireLeader(ctx);

      // Cannot remove self
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove yourself from the organization',
        });
      }

      const membership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: input.userId,
      });

      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        });
      }

      // Cannot remove another leader
      if (membership.role === 'leader') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove another leader. Transfer leadership first.',
        });
      }

      await ctx.models.OrganizationMember.update(
        { organizationId: input.organizationId, userId: input.userId },
        { status: 'inactive', updatedAt: Date.now() }
      );

      return { success: true };
    }),

  // Accept invitation
  acceptInvitation: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<{ message: string }> => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Check subscription status
      const organization = await ctx.models.Organization.get({ id: input.organizationId });
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      const now = Date.now();
      const isTrialActive =
        organization.subscriptionStatus === 'trial' && now < organization.trialEndDate;
      const isSubscriptionActive = organization.subscriptionStatus === 'active';

      if (!isTrialActive && !isSubscriptionActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Organization subscription is inactive',
        });
      }

      // Check seat availability
      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });
      const activeMembers = members.filter((m: any) => m.status === 'active').length;

      if (activeMembers >= organization.seatCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All seats are in use',
        });
      }

      // Verify pending invitation exists
      const membership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      if (!membership || membership.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No pending invitation found',
        });
      }

      await ctx.models.OrganizationMember.update(
        { organizationId: input.organizationId, userId: ctx.userId },
        { status: 'active', updatedAt: Date.now() }
      );

      return { message: 'Invitation accepted successfully' };
    }),

  // Reject invitation
  rejectInvitation: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const membership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      if (!membership || membership.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No pending invitation found',
        });
      }

      await ctx.models.OrganizationMember.remove({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      return { success: true };
    }),

  // List members
  list: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireOrganization(ctx);

      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });

      // Fetch user details
      const userIds = members.map((m: any) => m.userId);
      const users = await Promise.all(
        userIds.map((id: string) => ctx.models.User.get({ id }))
      );

      return members.map((member: any) => ({
        ...member,
        user: users.find((u: any) => u?.id === member.userId),
      }));
    }),

  // List pending invitations
  listPending: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<OrganizationMember[]> => {
      await requireLeader(ctx);

      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });

      const pendingMembers = members.filter((m: any) => m.status === 'pending');
      return pendingMembers as OrganizationMember[];
    }),
});
