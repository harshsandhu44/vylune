#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VyluneStack } from '../lib/cdk-stack';
import { getEnvironmentConfig } from '../config/environments';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

const config = getEnvironmentConfig(environment);

new VyluneStack(app, config.stackName, {
  env: config.env,
  config,
  tags: {
    Environment: environment,
    Project: 'Vylune',
  },
});
