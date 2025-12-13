import { table, ProductModel, StockMovementModel, UserModel } from './db/client';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface Context {
  table: typeof table;
  models: {
    Product: typeof ProductModel;
    StockMovement: typeof StockMovementModel;
    User: typeof UserModel;
  };
  userId?: string;
  userRole?: string;
}

export const createContext = async (
  event?: APIGatewayProxyEventV2
): Promise<Context> => {
  const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub as
    | string
    | undefined;
  const userRole = event?.requestContext?.authorizer?.jwt?.claims?.[
    'custom:role'
  ] as string | undefined;

  return {
    table,
    models: {
      Product: ProductModel,
      StockMovement: StockMovementModel,
      User: UserModel,
    },
    userId,
    userRole,
  };
};
