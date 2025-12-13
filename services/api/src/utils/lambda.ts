import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { appRouter } from '../index';
import { createContext } from '../context';

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: async ({ event }: { event: APIGatewayProxyEventV2 }) => {
    return createContext(event);
  },
});
