import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConstructProps {
  table: dynamodb.Table;
}

export class LambdaConstruct extends Construct {
  public readonly apiHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.apiHandler = new lambda.Function(this, 'ApiHandler', {
      functionName: 'vylune-api-handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'utils/lambda.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../services/api'),
        {
          bundling: {
            image: lambda.Runtime.NODEJS_20_X.bundlingImage,
            command: [
              'bash',
              '-c',
              [
                'npm install -g bun',
                'cd /asset-input',
                'bun install --production',
                'bun build src/index.ts --outdir /asset-output --target node',
                'cp -r node_modules /asset-output/',
                'cp -r src /asset-output/',
              ].join(' && '),
            ],
          },
        }
      ),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
        NODE_ENV: 'production',
      },
    });

    props.table.grantReadWriteData(this.apiHandler);
  }
}
