import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { OrdersUseCase } from "../usecase/ordersUseCase";

const createOrderSchema = z.object({
  userEmail: z.string().email(),
  amount: z.number().positive(),
  description: z.string().min(1),
});

export class OrdersController {
  private ordersUseCase = new OrdersUseCase();

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = createOrderSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          details: parsed.error,
        });
      }

      const order = await this.ordersUseCase.createOrder(parsed.data);

      return reply.status(201).send(order);
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return reply.status(404).send({ error: "User not found" });
      }

      console.error(error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}