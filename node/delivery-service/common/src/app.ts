import Fastify from "fastify";
import { deliveryRoutes } from "./routes/deliveryRoutes";

export function buildApp() {
  const app = Fastify();

  app.get("/health", async () => {
    return { status: "ok" };
  });
  app.register(deliveryRoutes);


  return app;
}