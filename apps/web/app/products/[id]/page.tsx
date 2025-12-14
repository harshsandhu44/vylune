'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: product, isLoading, error } = trpc.product.get.useQuery({ id });
  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      router.push('/products');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-destructive">Error loading product: {error?.message || 'Product not found'}</p>
          <Link href="/products" className="text-primary hover:underline mt-4 block">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Link href="/products" className="text-sm text-muted-foreground hover:underline mb-4 block">
          ← Back to Products
        </Link>

        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/products/${id}/edit`)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">Description</h2>
              <p className="text-foreground">{product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">Price</h2>
              <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">Quantity</h2>
              <p className="text-2xl font-bold">{product.quantity}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{' '}
                {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
