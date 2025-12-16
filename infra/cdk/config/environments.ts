export interface EnvironmentConfig {
  env: {
    account?: string;
    region: string;
  };
  stackName: string;
  tableName: string;
  userPoolName: string;
  apiName: string;
  allowedOrigins: string[];
  removalPolicy: 'RETAIN' | 'DESTROY';
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
    },
    stackName: 'VyluneStack-Dev',
    tableName: 'VyluneTable-Dev',
    userPoolName: 'vylune-users-dev',
    apiName: 'vylune-api-dev',
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://stg.vylune.com',
    ],
    removalPolicy: 'DESTROY',
  },
  prd: {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
    },
    stackName: 'VyluneStack-Prd',
    tableName: 'VyluneTable-Prd',
    userPoolName: 'vylune-users-prd',
    apiName: 'vylune-api-prd',
    allowedOrigins: ['https://vylune.com', 'https://www.vylune.com'],
    removalPolicy: 'RETAIN',
  },
};

export function getEnvironmentConfig(env: string): EnvironmentConfig {
  const config = environments[env];
  if (!config) {
    throw new Error(
      `Unknown environment: ${env}. Valid environments are: ${Object.keys(environments).join(', ')}`
    );
  }
  return config;
}
