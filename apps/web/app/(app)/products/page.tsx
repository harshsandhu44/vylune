import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  status: 'ACTIVE' | 'ARCHIVED';
};

export default async function ProductsPage() {
  // TODO: replace with tRPC (listProducts) and make filters control query params/state
  const products: Product[] = [
    {
      id: 'p_1',
      sku: 'SKU-001',
      name: 'USB-C Cable',
      category: 'Cables',
      price: 299,
      cost: 120,
      stock: 12,
      status: 'ACTIVE',
    },
    {
      id: 'p_2',
      sku: 'SKU-002',
      name: 'AA Batteries',
      category: 'Power',
      price: 199,
      cost: 90,
      stock: 4,
      status: 'ACTIVE',
    },
    {
      id: 'p_3',
      sku: 'SKU-003',
      name: 'Old Adapter',
      category: 'Adapters',
      price: 499,
      cost: 300,
      stock: 0,
      status: 'ARCHIVED',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and adjust stock.</p>
        </div>
        <Button>
          {/* TODO: open Create Product dialog */}
          Add product
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Search SKU or name..." />
            <Input placeholder="Category..." />
            <Input placeholder="Status (ACTIVE/ARCHIVED)..." />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Apply</Button>
            <Button variant="outline">Reset</Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.sku}</TableCell>
                  <TableCell>
                    <Link className="underline underline-offset-4" href={`/products/${p.id}`}>
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right">{p.stock}</TableCell>
                  <TableCell className="text-right">₹{p.price}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* TODO: pagination UI once listProducts supports paging */}
        </CardContent>
      </Card>
    </div>
  );
}
