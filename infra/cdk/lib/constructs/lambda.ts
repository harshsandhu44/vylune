import * as iam from 'aws-cdk-lib/aws-iam';
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
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../services/api'), {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          local: {
            tryBundle(outputDir: string) {
              const { execSync } = require('child_process');
              const apiPath = path.join(__dirname, '../../../../services/api');

              // Run bun install and build
              execSync(`cd "${apiPath}" && bun install && bun run build`);

              // Copy the dist folder
              execSync(`cp -r "${apiPath}/dist/." "${outputDir}/"`);

              return true;
            },
          },
          command: ['echo', 'Using local bundling'],
        },
      }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
        NODE_ENV: 'production',
        SENDER_EMAIL: 'noreply@vylune.com', // Add your sender email here
      },
    });

    props.table.grantReadWriteData(this.apiHandler);

    this.apiHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      })
    );
  }
}
