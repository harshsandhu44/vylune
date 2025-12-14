import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">Vylune</h1>
        <p className="text-muted-foreground mb-8">Modern Inventory Management System</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/products"
            className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Products</h2>
            <p className="text-muted-foreground">
              Manage your product catalog, pricing, and inventory levels
            </p>
          </Link>

          <Link
            href="/stock"
            className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Stock Movements</h2>
            <p className="text-muted-foreground">
              Track inventory changes and stock adjustments
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
