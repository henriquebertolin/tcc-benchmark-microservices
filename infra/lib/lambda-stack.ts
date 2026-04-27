import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  dbEndpoint: string;
}

const projectRoot = path.join(__dirname, "../..");

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const databaseUrl =
      `postgres://postgres:mE8pJUGBeqp62Ttn7wNQzQK,_oevXa@${props.dbEndpoint}:5432/benchmarkdb?sslmode=require`;

    const api = new apigwv2.HttpApi(this, "BenchmarkLambdaApi", {
      apiName: "tcc-benchmark-lambda-api",
    });

    const commonLambdaProps = {
      projectRoot,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1769,
      timeout: cdk.Duration.seconds(15),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [props.lambdaSecurityGroup],
      environment: {
        DATABASE_URL: databaseUrl,
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
      },
    };

    const userServiceLambda = new nodejs.NodejsFunction(this, "UserServiceLambda", {
      ...commonLambdaProps,
      entry: path.join(projectRoot, "node/user-service/serverless/src/handler.ts"),
    });

    const orderServiceLambda = new nodejs.NodejsFunction(this, "OrderServiceLambda", {
      ...commonLambdaProps,
      entry: path.join(projectRoot, "node/orders-service/serverless/src/handler.ts"),
      environment: {
        ...commonLambdaProps.environment,
        USER_SERVICE_URL: api.apiEndpoint,
        NOTIFICATION_SERVICE_URL: api.apiEndpoint,
      },
    });

    const notificationServiceLambda = new nodejs.NodejsFunction(this, "NotificationServiceLambda", {
      ...commonLambdaProps,
      entry: path.join(projectRoot, "node/notifications-service/serverless/src/handler.ts"),
      environment: {
        ...commonLambdaProps.environment,
        DELIVERY_SERVICE_URL: api.apiEndpoint,
      },
    });

    const deliveryServiceLambda = new nodejs.NodejsFunction(this, "DeliveryServiceLambda", {
      ...commonLambdaProps,
      entry: path.join(projectRoot, "node/delivery-service/serverless/src/handler.ts"),
    });

    api.addRoutes({
      path: "/users/by-email",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "UserServiceIntegration",
        userServiceLambda
      ),
    });

    api.addRoutes({
      path: "/orders",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "OrderServiceIntegration",
        orderServiceLambda
      ),
    });

    api.addRoutes({
      path: "/notifications",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "NotificationServiceIntegration",
        notificationServiceLambda
      ),
    });

    api.addRoutes({
      path: "/send",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "DeliveryServiceIntegration",
        deliveryServiceLambda
      ),
    });

    new cdk.CfnOutput(this, "LambdaApiUrl", {
      value: api.apiEndpoint,
    });
  }
}