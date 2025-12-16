import { Table } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { OneTableSchema } from './schema';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const table: Table = new Table({
  name: process.env.TABLE_NAME || 'VyluneTable',
  client,
  schema: OneTableSchema,
  logger: process.env.NODE_ENV === 'development',
  uuid: () => Bun.randomUUIDv7(),
  timestamps: true,
});

export const ProductModel = table.getModel('Product') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const StockMovementModel = table.getModel('StockMovement') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const UserModel = table.getModel('User') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const OrganizationModel = table.getModel('Organization') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const OrganizationMemberModel = table.getModel('OrganizationMember') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const SubscriptionModel = table.getModel('Subscription') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const PolarWebhookEventModel = table.getModel('PolarWebhookEvent') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
