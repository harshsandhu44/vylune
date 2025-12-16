import {
  table,
  ProductModel,
  StockMovementModel,
  UserModel,
  OrganizationModel,
  OrganizationMemberModel,
} from './db/client';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface Context {
  table: typeof table;
  models: {
    Product: typeof ProductModel;
    StockMovement: typeof StockMovementModel;
    User: typeof UserModel;
    Organization: typeof OrganizationModel;
    OrganizationMember: typeof OrganizationMemberModel;
  };
  userId?: string;
  userRole?: string;
}

export const createContext = async (event?: APIGatewayProxyEventV2): Promise<Context> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorizer = (event?.requestContext as any)?.authorizer;
  const userId = authorizer?.jwt?.claims?.sub as string | undefined;
  const userRole = authorizer?.jwt?.claims?.['custom:role'] as string | undefined;

  return {
    table,
    models: {
      Product: ProductModel,
      StockMovement: StockMovementModel,
      User: UserModel,
      Organization: OrganizationModel,
      OrganizationMember: OrganizationMemberModel,
    },
    userId,
    userRole,
  };
};
