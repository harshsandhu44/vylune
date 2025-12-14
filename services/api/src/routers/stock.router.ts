import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { randomUUID } from 'crypto';
import type { Context } from '../context';
import { CreateStockMovementSchema } from '@vylune/core/schemas';

const t = initTRPC.context<Context>().create();

export const stockRouter = t.router({
  list: t.procedure
    .input(z.object({ productId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.productId) {
        const movements = await ctx.models.StockMovement.find({
          productId: input.productId,
        });
        return movements;
      }

      const movements = await ctx.models.StockMovement.find(
        {},
        { index: 'gs1', where: '${gs1pk} = {STOCKS}' }
      );
      return movements;
    }),

  create: t.procedure.input(CreateStockMovementSchema).mutation(async ({ ctx, input }) => {
    const now = new Date().toISOString();
    const movement = await ctx.models.StockMovement.create({
      id: randomUUID(),
      ...input,
      createdAt: now,
    } as any);

    const product = await ctx.models.Product.get({ id: input.productId });
    if (product) {
      let newQuantity = product.quantity;

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
        updatedAt: now,
      } as any);
    }

    return movement;
  }),
});
