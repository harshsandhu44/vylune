import { z } from 'zod';

export const OrganizationRoleSchema = z.enum(['leader', 'member', 'pending']);
export const OrganizationStatusSchema = z.enum(['active', 'inactive', 'pending']); // Re-using userStatusEnum values
export const SubscriptionStatusSchema = z.enum(['trial', 'active', 'past_due', 'cancelled', 'expired']);

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255),
  leaderId: z.string().uuid(),
  subscriptionStatus: SubscriptionStatusSchema,
  trialStartDate: z.number(),
  trialEndDate: z.number(),
  polarCustomerId: z.string().optional(),
  polarSubscriptionId: z.string().optional(),
  polarCheckoutId: z.string().optional(),
  seatCount: z.number().min(5).default(5),
  baseSeatCount: z.number().default(5),
  additionalSeats: z.number().min(0).default(0),
  currentPeriodStart: z.number().optional(),
  currentPeriodEnd: z.number().optional(),
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  subscriptionStatus: true,
  trialStartDate: true,
  trialEndDate: true,
  seatCount: true,
  baseSeatCount: true,
  additionalSeats: true,
  cancelAtPeriodEnd: true,
});

export const OrganizationMemberSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: OrganizationRoleSchema,
  status: OrganizationStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CreateOrganizationMemberSchema = OrganizationMemberSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  polarSubscriptionId: z.string(),
  polarCustomerId: z.string(),
  polarCheckoutId: z.string().optional(),
  status: z.enum(['active', 'past_due', 'cancelled', 'expired']),
  baseSeatCount: z.number(),
  additionalSeats: z.number(),
  totalSeats: z.number(),
  basePrice: z.number(),
  additionalSeatPrice: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
  currentPeriodStart: z.number(),
  currentPeriodEnd: z.number(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CreateSubscriptionSchema = SubscriptionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type CreateOrganizationMember = z.infer<typeof CreateOrganizationMemberSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
