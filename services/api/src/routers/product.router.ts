import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { CreateProductSchema, UpdateProductSchema, type Product } from '@vylune/core/schemas';
import { requireOrganization, requireActiveSubscription } from '../middleware/organization.middleware';

const t = initTRPC.context<Context>().create();

export const productRouter = t.router({
  list: t.procedure.query(async ({ ctx }): Promise<Product[]> => {
    await requireOrganization(ctx);
    await requireActiveSubscription(ctx);

    const products = await ctx.models.Product.find(
      { gs1pk: `ORGANIZATION#${ctx.organizationId}#PRODUCTS` },
      { index: 'gs1' }
    );
    return products as Product[];
  }),

  get: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<Product | null> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      const product = await ctx.models.Product.get({ id: input.id });

      // Verify product belongs to organization
      if (product && product.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product does not belong to your organization',
        });
      }

      return (product as Product) || null;
    }),

  create: t.procedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }): Promise<Product> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      const product = await ctx.models.Product.create({
        ...input,
        organizationId: ctx.organizationId,
      });
      return product as Product;
    }),

  update: t.procedure
    .input(z.object({ id: z.string().uuid(), data: UpdateProductSchema }))
    .mutation(async ({ ctx, input }): Promise<Product> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      // Verify product belongs to organization
      const existingProduct = await ctx.models.Product.get({ id: input.id });
      if (!existingProduct || existingProduct.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product does not belong to your organization',
        });
      }

      const product = await ctx.models.Product.update({
        id: input.id,
        ...input.data,
      });
      return product as Product;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }): Promise<void> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      // Verify product belongs to organization
      const product = await ctx.models.Product.get({ id: input.id });
      if (!product || product.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product does not belong to your organization',
        });
      }

      await ctx.models.Product.remove({ id: input.id });
    }),
});
