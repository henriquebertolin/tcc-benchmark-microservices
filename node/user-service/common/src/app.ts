import Fastify from "fastify";
import { userRoutes } from "./routes/userRoutes";

export function buildApp() {
  const app = Fastify();

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(userRoutes);

  return app;
}