'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function ProductsPage() {
  const { data: products, isLoading, error } = trpc.product.list.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-destructive">Error loading products: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:underline mb-2 block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold">Products</h1>
          </div>
          <Link
            href="/products/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            New Product
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Link
              href="/products/new"
              className="text-primary hover:underline"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <span className="text-sm text-muted-foreground">{product.sku}</span>
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.quantity}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
