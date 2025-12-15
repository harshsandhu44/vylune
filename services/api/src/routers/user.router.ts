import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { CreateUserSchema, type User } from '@vylune/core/schemas';

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
      const users = await ctx.models.User.find({ cognitoId: input.cognitoId }, { index: 'gsi2', limit: 1 });
      return users.length > 0 ? (users[0] as User) : null;
    }),

  create: t.procedure.input(CreateUserSchema).mutation(async ({ ctx, input }): Promise<User> => {
    const now = Date.now(); // Get numeric timestamp
    const user = await ctx.models.User.create({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return user as User;
  }),
});
