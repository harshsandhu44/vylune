import {
  table,
  ProductModel,
  StockMovementModel,
  UserModel,
  OrganizationModel,
  OrganizationMemberModel,
  SubscriptionModel,
  PolarWebhookEventModel,
  OrganizationInvitationModel,
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
    Subscription: typeof SubscriptionModel;
    PolarWebhookEvent: typeof PolarWebhookEventModel;
    OrganizationInvitation: typeof OrganizationInvitationModel;
  };
  userId?: string;
  userRole?: string;
  organizationId?: string;
}

export const createContext = async (event?: APIGatewayProxyEventV2): Promise<Context> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorizer = (event?.requestContext as any)?.authorizer;
  const userId = authorizer?.jwt?.claims?.sub as string | undefined;
  const userRole = authorizer?.jwt?.claims?.['custom:role'] as string | undefined;

  // Extract organization ID from custom header
  const organizationId = event?.headers?.['x-organization-id'] as string | undefined;

  return {
    table,
    models: {
      Product: ProductModel,
      StockMovement: StockMovementModel,
      User: UserModel,
      Organization: OrganizationModel,
      OrganizationMember: OrganizationMemberModel,
      Subscription: SubscriptionModel,
      PolarWebhookEvent: PolarWebhookEventModel,
      OrganizationInvitation: OrganizationInvitationModel,
    },
    userId,
    userRole,
    organizationId,
  };
};
