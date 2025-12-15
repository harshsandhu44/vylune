import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'ARCHIVED';
};

type Movement = { id: string; type: 'ADD' | 'REMOVE'; qty: number; note?: string; at: string };

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // TODO: replace with tRPC (getProduct)
  const product: Product = {
    id,
    sku: 'SKU-001',
    name: 'USB-C Cable',
    category: 'Cables',
    cost: 120,
    price: 299,
    stock: 12,
    status: 'ACTIVE',
  };

  // TODO: replace with tRPC (listStockMovementsByProduct)
  const movements: Movement[] = [
    { id: 'm_1', type: 'ADD', qty: 10, note: 'Initial stock', at: '2025-12-12 09:40' },
    { id: 'm_2', type: 'REMOVE', qty: 2, note: 'Sold', at: '2025-12-15 10:20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.sku} • {product.category}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary">
            {/* TODO: open Adjust Stock dialog, call tRPC createStockMovement */}
            Adjust stock
          </Button>
          <Button variant="outline">
            {/* TODO: open Edit Product dialog, call tRPC updateProduct */}
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Key product info for quick decisions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1">
              <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Current stock</div>
            <div className="mt-1 text-lg font-semibold">{product.stock}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Cost</div>
            <div className="mt-1 text-lg font-semibold">₹{product.cost}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="mt-1 text-lg font-semibold">₹{product.price}</div>
          </div>

          <Separator className="md:col-span-4" />
          <div className="md:col-span-4 text-sm text-muted-foreground">
            {/* TODO: add image + attachments section (R2 object key/URL stored in DynamoDB) */}
            Images/attachments: not configured.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock movement log</CardTitle>
          <CardDescription>Read-only audit trail of adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Badge variant={m.type === 'ADD' ? 'default' : 'secondary'}>{m.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{m.qty}</TableCell>
                  <TableCell className="text-muted-foreground">{m.note ?? '-'}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
