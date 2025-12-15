import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { CreateStockMovementSchema, type StockMovement } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const stockRouter = t.router({
  list: t.procedure
    .input(z.object({ productId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }): Promise<StockMovement[]> => {
      if (input.productId) {
        const movements = await ctx.models.StockMovement.find({
          productId: input.productId,
        });
        return movements as StockMovement[];
      }

      const movements = await ctx.models.StockMovement.find(
        {},
        { index: 'gs1', where: '${gs1pk} = {STOCKS}' }
      );
      return movements as StockMovement[];
    }),

  create: t.procedure
    .input(CreateStockMovementSchema)
    .mutation(async ({ ctx, input }): Promise<StockMovement> => {
      const movement = await ctx.models.StockMovement.create({
        ...input,
      });

      const product = await ctx.models.Product.get({ id: input.productId });
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
