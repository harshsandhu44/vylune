import { Table } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { OneTableSchema } from './schema';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const table = new Table({
  name: process.env.TABLE_NAME || 'VyluneTable',
  client,
  schema: OneTableSchema,
  logger: process.env.NODE_ENV === 'development',
});

export const ProductModel = table.getModel('Product');
export const StockMovementModel = table.getModel('StockMovement');
export const UserModel = table.getModel('User');
