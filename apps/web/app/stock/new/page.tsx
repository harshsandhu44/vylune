import Link from 'next/link';
import { StockForm } from '@/components/forms/stock-form';

export default function NewStockMovementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Link href="/stock" className="text-sm text-muted-foreground hover:underline mb-4 block">
          ← Back to Stock Movements
        </Link>

        <h1 className="text-4xl font-bold mb-8">Record Stock Movement</h1>

        <div className="bg-card border border-border rounded-lg p-8">
          <StockForm />
        </div>
      </div>
    </div>
  );
}
