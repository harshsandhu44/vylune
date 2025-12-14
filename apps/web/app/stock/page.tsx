'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function StockPage() {
  const { data: movements, isLoading, error } = trpc.stock.list.useQuery({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-muted-foreground">Loading stock movements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <p className="text-destructive">Error loading stock movements: {error.message}</p>
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
            <h1 className="text-4xl font-bold">Stock Movements</h1>
          </div>
          <Link
            href="/stock/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            New Movement
          </Link>
        </div>

        {!movements || movements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No stock movements found</p>
            <Link
              href="/stock/new"
              className="text-primary hover:underline"
            >
              Record your first stock movement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Product ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-border hover:bg-accent">
                    <td className="py-3 px-4 text-sm">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{movement.productId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          movement.type === 'IN'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : movement.type === 'OUT'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{movement.quantity}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {movement.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
