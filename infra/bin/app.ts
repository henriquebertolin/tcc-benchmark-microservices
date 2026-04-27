#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PersistentStack } from '../lib/persistent-stack';
import { Ec2Stack } from '../lib/ec2-stack';
import { LambdaStack } from "../lib/lambda-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const persistentStack = new PersistentStack(app, 'PersistentStack', { env });

new Ec2Stack(app, 'Ec2Stack', {
  env,
  vpc: persistentStack.vpc,
  ec2SecurityGroup: persistentStack.ec2SecurityGroup,
  dbEndpoint: persistentStack.dbEndpoint,
  dbSecretArn: persistentStack.dbSecretArn,
});

new LambdaStack(app, "LambdaStack", {
  env,
  vpc: persistentStack.vpc,
  lambdaSecurityGroup: persistentStack.lambdaSecurityGroup,
  dbEndpoint: persistentStack.dbEndpoint,
});