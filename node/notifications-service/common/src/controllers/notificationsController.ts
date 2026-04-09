import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { NotificationsUseCase } from "../usecase/notificationsUseCase";

const createNotificationSchema = z.object({
    user_id: z.uuid(),
    order_id: z.uuid(),
    message: z.string().min(1),
});

export class NotificationsController {
    private notificationsUserCase = new NotificationsUseCase();

    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const parsed = createNotificationSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({
                    error: "invalid request body",
                    details: parsed.error
                });
            }

            const notification = await this.notificationsUserCase.createNotification(parsed.data);

            return reply.status(201).send(notification);

        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ error: error.message });
            }

            return reply.status(400).send({ error: "Unknown error" });
        }
    }
}