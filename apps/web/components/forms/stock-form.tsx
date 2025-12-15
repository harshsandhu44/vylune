'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStockMovementSchema, type CreateStockMovement } from '@vylune/core/schemas';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export function StockForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: products } = trpc.product.list.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStockMovement>({
    resolver: zodResolver(CreateStockMovementSchema),
    defaultValues: {
      productId: '',
      type: 'IN',
      quantity: 0,
      reason: '',
      performedBy: '',
    },
  });

  const createMutation = trpc.stock.create.useMutation({
    onSuccess: () => {
      utils.stock.list.invalidate();
      utils.product.list.invalidate();
      router.push('/stock');
    },
  });

  const onSubmit = (data: CreateStockMovement) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="productId" className="block text-sm font-medium mb-2">
          Product <span className="text-destructive">*</span>
        </label>
        <select
          id="productId"
          {...register('productId')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">Select a product</option>
          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Movement Type <span className="text-destructive">*</span>
        </label>
        <select
          id="type"
          {...register('type')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="IN">IN - Receiving stock</option>
          <option value="OUT">OUT - Removing stock</option>
          <option value="ADJUSTMENT">ADJUSTMENT - Inventory correction</option>
        </select>
        {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium mb-2">
          Quantity <span className="text-destructive">*</span>
        </label>
        <input
          id="quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
        {errors.quantity && (
          <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-2">
          Reason
        </label>
        <textarea
          id="reason"
          rows={3}
          {...register('reason')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          placeholder="Optional reason for this stock movement"
        />
        {errors.reason && <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>}
      </div>

      <div>
        <label htmlFor="performedBy" className="block text-sm font-medium mb-2">
          Performed By (User ID) <span className="text-destructive">*</span>
        </label>
        <input
          id="performedBy"
          type="text"
          {...register('performedBy')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          placeholder="User UUID"
        />
        {errors.performedBy && (
          <p className="text-sm text-destructive mt-1">{errors.performedBy.message}</p>
        )}
      </div>

      {createMutation.error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Movement'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
