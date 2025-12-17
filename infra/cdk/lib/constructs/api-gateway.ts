import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigatewayv2Authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayConstructProps {
  apiHandler: lambda.Function;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  apiName: string;
  allowedOrigins: string[];
}

export class ApiGatewayConstruct extends Construct {
  public readonly httpApi: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const authorizer = new apigatewayv2Authorizers.HttpUserPoolAuthorizer(
      'CognitoAuthorizer',
      props.userPool,
      {
        userPoolClients: [props.userPoolClient],
        identitySource: ['$request.header.Authorization'],
      }
    );

    const integration = new apigatewayv2Integrations.HttpLambdaIntegration(
      'ApiIntegration',
      props.apiHandler
    );

    this.httpApi = new apigatewayv2.HttpApi(this, 'VyluneApi', {
      apiName: props.apiName,
      description: 'Vylune Inventory Management API',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'x-organization-id',
          'sec-ch-ua',
          'sec-ch-ua-mobile',
          'sec-ch-ua-platform',
        ],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: props.allowedOrigins,
        allowCredentials: true,
        exposeHeaders: ['x-organization-id'],
      },
    });

    this.httpApi.addRoutes({
      path: '/trpc/{proxy+}',
      methods: [
        apigatewayv2.HttpMethod.GET,
        apigatewayv2.HttpMethod.POST,
        apigatewayv2.HttpMethod.PUT,
        apigatewayv2.HttpMethod.DELETE,
      ],
      integration,
      authorizer,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.httpApi.url!,
      description: 'API Gateway URL',
    });
  }
}
