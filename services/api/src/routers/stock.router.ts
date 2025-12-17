import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { CreateStockMovementSchema, type StockMovement } from '@vylune/core/schemas';
import { requireOrganization, requireActiveSubscription } from '../middleware/organization.middleware';

const t = initTRPC.context<Context>().create();

export const stockRouter = t.router({
  list: t.procedure
    .input(z.object({ productId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }): Promise<StockMovement[]> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      if (input.productId) {
        // Verify product belongs to organization
        const product = await ctx.models.Product.get({ id: input.productId });
        if (!product || product.organizationId !== ctx.organizationId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Product does not belong to your organization',
          });
        }

        const movements = await ctx.models.StockMovement.find({
          productId: input.productId,
        });
        return movements as StockMovement[];
      }

      // List all stock movements for organization
      const movements = await ctx.models.StockMovement.find(
        { gs1pk: `ORGANIZATION#${ctx.organizationId}#STOCKS` },
        { index: 'gs1' }
      );
      return movements as StockMovement[];
    }),

  create: t.procedure
    .input(CreateStockMovementSchema)
    .mutation(async ({ ctx, input }): Promise<StockMovement> => {
      await requireOrganization(ctx);
      await requireActiveSubscription(ctx);

      // Verify product belongs to organization
      const product = await ctx.models.Product.get({ id: input.productId });
      if (!product || product.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product does not belong to your organization',
        });
      }

      const movement = await ctx.models.StockMovement.create({
        ...input,
        organizationId: ctx.organizationId,
      });

      if (product) {
        let newQuantity = (product as { quantity: number }).quantity;

        if (input.type === 'IN') {
          newQuantity += input.quantity;
        } else if (input.type === 'OUT') {
          newQuantity -= input.quantity;
        } else if (input.type === 'ADJUSTMENT') {
          newQuantity = input.quantity;
        }

        await ctx.models.Product.update({
          id: input.productId,
          quantity: Math.max(0, newQuantity),
        });
      }

      return movement as StockMovement;
    }),
});
