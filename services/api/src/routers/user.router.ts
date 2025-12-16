import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { CreateUserSchema, type User, OrganizationMemberSchema } from '@vylune/core/schemas';

type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

const t = initTRPC.context<Context>().create();

export const userRouter = t.router({
  list: t.procedure.query(async ({ ctx }): Promise<User[]> => {
    const users = await ctx.models.User.find({ gs1pk: 'USERS' }, { index: 'gs1' });
    return users as User[];
  }),

  get: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<User | null> => {
      const user = await ctx.models.User.get({ id: input.id });
      return (user as User) || null;
    }),

  getByCognitoId: t.procedure
    .input(z.object({ cognitoId: z.string() }))
    .query(async ({ ctx, input }): Promise<User | null> => {
      const users = await ctx.models.User.find(
        { cognitoId: input.cognitoId },
        { index: 'gsi2', limit: 1 }
      );
      return users.length > 0 ? (users[0] as User) : null;
    }),

  create: t.procedure
    .input(
      CreateUserSchema.merge(z.object({ organizationName: z.string().min(2).max(255).optional() }))
    )
    .mutation(async ({ ctx, input }): Promise<User> => {
      const now = Date.now(); // Get numeric timestamp
      const { organizationName, ...userData } = input;
      const user = await ctx.models.User.create({
        ...userData,
        createdAt: now,
        updatedAt: now,
      });

      if (organizationName) {
        const organization = await ctx.models.Organization.create({
          name: organizationName,
          leaderId: user.id,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.models.OrganizationMember.create({
          organizationId: organization.id,
          userId: user.id,
          role: 'leader',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
      }
      return user as User;
    }),

  createOrganization: t.procedure
    .input(z.object({ name: z.string().min(2).max(255) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error('Unauthorized');
      }
      const now = Date.now();
      const organization = await ctx.models.Organization.create({
        name: input.name,
        leaderId: ctx.userId,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.models.OrganizationMember.create({
        organizationId: organization.id,
        userId: ctx.userId,
        role: 'leader',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      return organization;
    }),

  inviteUserToOrganization: t.procedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error('Unauthorized');
      }

      const member = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      if (!member || member.role !== 'leader') {
        throw new Error('Forbidden: Only leaders can invite members.');
      }

      const invitedUser = await ctx.models.User.find(
        { email: input.email },
        { index: 'gs1', limit: 1 }
      );
      if (invitedUser.length === 0) {
        throw new Error('Invited user not found.');
      }

      const now = Date.now();
      await ctx.models.OrganizationMember.create({
        organizationId: input.organizationId,
        userId: invitedUser[0].id,
        role: input.role,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });

      return { message: 'Invitation sent.' };
    }),

  acceptOrganizationInvitation: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error('Unauthorized');
      }

      const member = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      if (!member || member.status !== 'pending') {
        throw new Error('No pending invitation found for this organization.');
      }

      await ctx.models.OrganizationMember.update(
        { organizationId: input.organizationId, userId: ctx.userId },
        { status: 'active', updatedAt: Date.now() }
      );

      return { message: 'Invitation accepted.' };
    }),

  listUserOrganizations: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    const memberships = await ctx.models.OrganizationMember.find(
      { gs1pk: `USER#${ctx.userId}` },
      { index: 'gs1' }
    );

    const organizations = await Promise.all(
      memberships.map((membership: OrganizationMember) =>
        ctx.models.Organization.get({ id: membership.organizationId })
      )
    );

    return organizations.filter(Boolean);
  }),

  listOrganizationMembers: t.procedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error('Unauthorized');
      }

      const userMembership = await ctx.models.OrganizationMember.get({
        organizationId: input.organizationId,
        userId: ctx.userId,
      });

      if (!userMembership || userMembership.status !== 'active') {
        throw new Error('Forbidden: Not an active member of this organization.');
      }

      const members = await ctx.models.OrganizationMember.find(
        { pk: `ORGANIZATION#${input.organizationId}` },
        {}
      );

      const memberUsers = await Promise.all(
        members.map((member: OrganizationMember) => ctx.models.User.get({ id: member.userId }))
      );

      return memberUsers.filter(Boolean);
    }),
});
