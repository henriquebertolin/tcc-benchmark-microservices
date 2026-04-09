import Fastify from "fastify";
import { orderRoutes } from "./routes/orderRoutes";

export function buildApp() {
  const app = Fastify();

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(orderRoutes);

  return app;
}