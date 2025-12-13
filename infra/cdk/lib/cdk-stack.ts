import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBConstruct } from './constructs/dynamodb';
import { CognitoConstruct } from './constructs/cognito';
import { LambdaConstruct } from './constructs/lambda';
import { ApiGatewayConstruct } from './constructs/api-gateway';

export class VyluneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const db = new DynamoDBConstruct(this, 'Database');

    const auth = new CognitoConstruct(this, 'Auth');

    const lambda = new LambdaConstruct(this, 'Lambda', {
      table: db.table,
    });

    const api = new ApiGatewayConstruct(this, 'ApiGateway', {
      apiHandler: lambda.apiHandler,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: auth.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: db.table.tableName,
      description: 'DynamoDB Table Name',
    });
  }
}
