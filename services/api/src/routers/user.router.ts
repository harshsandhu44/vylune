import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { CreateUserSchema } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const userRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    const users = await ctx.models.User.find(
      {},
      { index: 'gs1', where: '${gs1pk} = {USERS}' }
    );
    return users;
  }),

  get: t.procedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const user = await ctx.models.User.get({ id: input.id });
    return user || null;
  }),

  create: t.procedure.input(CreateUserSchema).mutation(async ({ ctx, input }) => {
    const now = new Date().toISOString();
    const user = await ctx.models.User.create({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return user;
  }),
});
