import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBConstruct } from './constructs/dynamodb';
import { CognitoConstruct } from './constructs/cognito';
import { LambdaConstruct } from './constructs/lambda';
import { ApiGatewayConstruct } from './constructs/api-gateway';
import type { EnvironmentConfig } from '../config/environments';

export interface VyluneStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class VyluneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VyluneStackProps) {
    super(scope, id, props);

    const { config } = props;

    const db = new DynamoDBConstruct(this, 'Database', {
      tableName: config.tableName,
      removalPolicy: config.removalPolicy,
    });

    const auth = new CognitoConstruct(this, 'Auth', {
      userPoolName: config.userPoolName,
    });

    const lambda = new LambdaConstruct(this, 'Lambda', {
      table: db.table,
    });

    const api = new ApiGatewayConstruct(this, 'ApiGateway', {
      apiHandler: lambda.apiHandler,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      apiName: config.apiName,
      allowedOrigins: config.allowedOrigins,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: auth.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${config.stackName}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${config.stackName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: db.table.tableName,
      description: 'DynamoDB Table Name',
      exportName: `${config.stackName}-TableName`,
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS Region',
      exportName: `${config.stackName}-Region`,
    });
  }
}
