import Fastify from "fastify";
import { notificationRoutes } from "./routes/notificationRoutes";

export function buildApp() {
  const app = Fastify();

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(notificationRoutes);

  return app;
}