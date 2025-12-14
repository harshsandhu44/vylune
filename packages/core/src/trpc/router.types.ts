import type { Product, CreateProduct, UpdateProduct } from '../schemas/product.schema';
import type { StockMovement, CreateStockMovement } from '../schemas/stock.schema';
import type { User, CreateUser } from '../schemas/user.schema';

export interface AppRouter {
  product: {
    list: { input: void; output: Product[] };
    get: { input: { id: string }; output: Product | null };
    create: { input: CreateProduct; output: Product };
    update: { input: { id: string; data: UpdateProduct }; output: Product };
    delete: { input: { id: string }; output: void };
  };
  stock: {
    list: { input: { productId?: string }; output: StockMovement[] };
    create: { input: CreateStockMovement; output: StockMovement };
  };
  user: {
    list: { input: void; output: User[] };
    get: { input: { id: string }; output: User | null };
    create: { input: CreateUser; output: User };
  };
}
