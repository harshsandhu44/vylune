import { TRPCError } from '@trpc/server';
import type { Context } from '../context';

export const requireOrganization = async (ctx: Context) => {
  if (!ctx.organizationId || !ctx.userId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Organization context required',
    });
  }

  // Verify active membership
  const membership = await ctx.models.OrganizationMember.get({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
  });

  if (!membership || membership.status !== 'active') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not an active member of this organization',
    });
  }

  return { membership };
};

export const requireLeader = async (ctx: Context) => {
  const { membership } = await requireOrganization(ctx);

  if (membership.role !== 'leader') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Leader access required',
    });
  }

  return { membership };
};

export const requireActiveSubscription = async (ctx: Context) => {
  await requireOrganization(ctx);

  const organization = await ctx.models.Organization.get({
    id: ctx.organizationId,
  });

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
      message: 'Subscription expired or inactive',
    });
  }

  return { organization };
};
