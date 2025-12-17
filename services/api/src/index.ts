import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { productRouter } from './routers/product.router';
import { stockRouter } from './routers/stock.router';
import { userRouter } from './routers/user.router';
import { organizationRouter } from './routers/organization.router';
import { subscriptionRouter } from './routers/subscription.router';
import { memberRouter } from './routers/member.router';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  product: productRouter,
  stock: stockRouter,
  user: userRouter,
  organization: organizationRouter,
  subscription: subscriptionRouter,
  member: memberRouter,
});

export type AppRouter = typeof appRouter;
