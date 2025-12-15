import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { CreateProductSchema, UpdateProductSchema, type Product } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const productRouter = t.router({
  list: t.procedure.query(async ({ ctx }): Promise<Product[]> => {
    const products = await ctx.models.Product.find(
      {},
      { index: 'gs1', where: '${gs1pk} = {PRODUCTS}' }
    );
    return products as Product[];
  }),

  get: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<Product | null> => {
      const product = await ctx.models.Product.get({ id: input.id });
      return (product as Product) || null;
    }),

  create: t.procedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }): Promise<Product> => {
      const product = await ctx.models.Product.create({
        ...input,
      });
      return product as Product;
    }),

  update: t.procedure
    .input(z.object({ id: z.string().uuid(), data: UpdateProductSchema }))
    .mutation(async ({ ctx, input }): Promise<Product> => {
      const product = await ctx.models.Product.update({
        id: input.id,
        ...input.data,
      });
      return product as Product;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<void> => {
      await ctx.models.Product.remove({ id: input.id });
    }),
});
