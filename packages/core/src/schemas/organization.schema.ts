import { z } from 'zod';

export const OrganizationRoleSchema = z.enum(['leader', 'member', 'pending']);
export const OrganizationStatusSchema = z.enum(['active', 'inactive', 'pending']); // Re-using userStatusEnum values

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255),
  leaderId: z.string().uuid(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type CreateOrganizationMember = z.infer<typeof CreateOrganizationMemberSchema>;
