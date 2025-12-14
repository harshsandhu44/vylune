import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { randomUUID } from 'crypto';
import type { Context } from '../context';
import { CreateProductSchema, UpdateProductSchema } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const productRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    const products = await ctx.models.Product.find(
      {},
      { index: 'gs1', where: '${gs1pk} = {PRODUCTS}' }
    );
    return products;
  }),

  get: t.procedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const product = await ctx.models.Product.get({ id: input.id });
    return product || null;
  }),

  create: t.procedure.input(CreateProductSchema).mutation(async ({ ctx, input }) => {
    const now = new Date().toISOString();
    const product = await ctx.models.Product.create({
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    } as any);
    return product;
  }),

  update: t.procedure
    .input(z.object({ id: z.string().uuid(), data: UpdateProductSchema }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.models.Product.update({
        id: input.id,
        ...input.data,
        updatedAt: new Date().toISOString(),
      } as any);
      return product;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.models.Product.remove({ id: input.id });
    }),
});
