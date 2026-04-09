import { FastifyInstance } from "fastify";
import { DeliveryController } from "../controllers/deliveryController";

export async function deliveryRoutes(app: FastifyInstance) {
  const deliveryController = new DeliveryController();

  app.post("/send", deliveryController.send.bind(deliveryController));
}