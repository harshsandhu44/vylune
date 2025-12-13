#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VyluneStack } from '../lib/cdk-stack';

const app = new cdk.App();
new VyluneStack(app, 'VyluneStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
