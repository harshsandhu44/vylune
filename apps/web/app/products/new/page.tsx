import Link from 'next/link';
import { ProductForm } from '@/components/forms/product-form';

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Link href="/products" className="text-sm text-muted-foreground hover:underline mb-4 block">
          ← Back to Products
        </Link>

        <h1 className="text-4xl font-bold mb-8">Create New Product</h1>

        <div className="bg-card border border-border rounded-lg p-8">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
