import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { requireLeader } from '../middleware/organization.middleware';
import { polarService } from '../services/polar.service';
import type { Subscription } from '@vylune/core/schemas';

export const subscriptionRouter = t.router({
  // Create checkout session
  createCheckout: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), seatCount: z.number().min(5) }))
    .mutation(async ({ ctx, input }): Promise<{ checkoutUrl: string }> => {
      await requireLeader(ctx);

      // Get current seat usage
      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });
      const activeMembers = members.filter((m: any) => m.status === 'active').length;

      if (input.seatCount < activeMembers) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot set seat count below active members (${activeMembers})`,
        });
      }

      const organization = await ctx.models.Organization.get({ id: input.organizationId });
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      const user = await ctx.models.User.get({ id: ctx.userId });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const result = await polarService.createCheckout({
        organizationId: organization.id,
        organizationName: organization.name,
        customerEmail: user.email,
        seatCount: input.seatCount,
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      });

      // Store checkout ID
      await ctx.models.Organization.update(
        { id: organization.id },
        { polarCheckoutId: result.checkoutId, updatedAt: Date.now() }
      );

      return { checkoutUrl: result.checkoutUrl };
    }),

  // Update seats
  updateSeats: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), newSeatCount: z.number().min(5) }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      await requireLeader(ctx);

      const organization = await ctx.models.Organization.get({ id: input.organizationId });
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      if (!organization.polarSubscriptionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active subscription',
        });
      }

      // Validate seat count
      const members = await ctx.models.OrganizationMember.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });
      const activeMembers = members.filter((m: any) => m.status === 'active').length;

      if (input.newSeatCount < activeMembers) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reduce seats below active members',
        });
      }

      // Update in Polar.sh
      await polarService.updateSubscription({
        subscriptionId: organization.polarSubscriptionId,
        seatCount: input.newSeatCount,
      });

      // Update locally
      const additionalSeats = Math.max(0, input.newSeatCount - 5);
      await ctx.models.Organization.update(
        { id: organization.id },
        {
          seatCount: input.newSeatCount,
          additionalSeats,
          updatedAt: Date.now(),
        }
      );

      return { success: true };
    }),

  // Cancel subscription
  cancelSubscription: t.procedure
    .input(z.object({ organizationId: z.string().uuid(), cancelAtPeriodEnd: z.boolean() }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      await requireLeader(ctx);

      const organization = await ctx.models.Organization.get({ id: input.organizationId });
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      if (!organization.polarSubscriptionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active subscription',
        });
      }

      await polarService.cancelSubscription({
        subscriptionId: organization.polarSubscriptionId,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      });

      await ctx.models.Organization.update(
        { id: organization.id },
        {
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          subscriptionStatus: input.cancelAtPeriodEnd ? 'active' : 'cancelled',
          updatedAt: Date.now(),
        }
      );

      return { success: true };
    }),

  // Get subscription history
  getHistory: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<Subscription[]> => {
      await requireLeader(ctx);

      const subscriptions = await ctx.models.Subscription.find({
        pk: `ORGANIZATION#${input.organizationId}`,
      });

      return subscriptions as Subscription[];
    }),
});
