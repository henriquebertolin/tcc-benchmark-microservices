import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "../../common/src/app";

const app = buildApp();
const proxy = awsLambdaFastify(app);

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return proxy(event, context);
};