import { FastifyInstance } from "fastify";
import { NotificationsController } from "../controllers/notificationsController";

export async function notificationRoutes(app: FastifyInstance) {
  const notificationsController = new NotificationsController();

  app.post("/notifications", notificationsController.create.bind(notificationsController));
}