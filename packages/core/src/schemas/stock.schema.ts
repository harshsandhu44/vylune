import { z } from 'zod';

export const StockMovementTypeSchema = z.enum(['IN', 'OUT', 'ADJUSTMENT']);

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  type: StockMovementTypeSchema,
  quantity: z.number().int(),
  reason: z.string().optional(),
  performedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateStockMovementSchema = StockMovementSchema.omit({
  id: true,
  createdAt: true,
});

export type StockMovement = z.infer<typeof StockMovementSchema>;
export type CreateStockMovement = z.infer<typeof CreateStockMovementSchema>;
export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;
