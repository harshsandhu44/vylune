import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type LowStockItem = { id: string; sku: string; name: string; stock: number; threshold: number };
type Movement = {
  id: string;
  productId: string;
  sku: string;
  type: 'ADD' | 'REMOVE';
  qty: number;
  at: string;
};

export default async function DashboardPage() {
  // TODO: replace with tRPC (stats query)
  const stats = { totalSkus: 42, totalUnits: 1280, totalStockValue: 356000, lowStockCount: 6 };

  // TODO: replace with tRPC (low stock query)
  const lowStock: LowStockItem[] = [
    { id: 'p_1', sku: 'SKU-001', name: 'USB-C Cable', stock: 2, threshold: 5 },
    { id: 'p_2', sku: 'SKU-002', name: 'AA Batteries', stock: 4, threshold: 10 },
  ];

  // TODO: replace with tRPC (recent movements query)
  const recent: Movement[] = [
    { id: 'm_1', productId: 'p_1', sku: 'SKU-001', type: 'REMOVE', qty: 3, at: '2025-12-15 10:20' },
    { id: 'm_2', productId: 'p_2', sku: 'SKU-002', type: 'ADD', qty: 20, at: '2025-12-14 18:05' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Single-location inventory overview.</p>
        </div>
        <Button asChild>
          <Link href="/products">Manage products</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total SKUs</CardDescription>
            <CardTitle className="text-2xl">{stats.totalSkus}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total units</CardDescription>
            <CardTitle className="text-2xl">{stats.totalUnits}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stock value (₹)</CardDescription>
            <CardTitle className="text-2xl">
              {stats.totalStockValue.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low stock</CardDescription>
            <CardTitle className="text-2xl">{stats.lowStockCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low-stock items</CardTitle>
            <CardDescription>Products below the threshold.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.sku}</TableCell>
                    <TableCell>
                      <Link className="underline underline-offset-4" href={`/products/${p.id}`}>
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">
                        {p.stock} / {p.threshold}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent movements</CardTitle>
            <CardDescription>Latest stock adjustments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.sku}</TableCell>
                    <TableCell>
                      <Badge variant={m.type === 'ADD' ? 'default' : 'secondary'}>{m.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.qty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{m.at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
