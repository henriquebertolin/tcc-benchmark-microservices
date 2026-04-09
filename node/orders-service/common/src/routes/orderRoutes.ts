import { FastifyInstance } from "fastify";
import { OrdersController } from "../controllers/ordersController";

export async function orderRoutes(app: FastifyInstance) {
  const ordersController = new OrdersController();

  app.post("/orders", ordersController.create.bind(ordersController));
}