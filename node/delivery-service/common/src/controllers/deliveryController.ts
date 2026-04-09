import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { deliveryUseCase } from "../usecase/DeliveryUsecase";

const sendNotificationSchema = z.object({
    notification_id: z.uuid(),
    user_id: z.uuid(),
    message: z.string().min(1),
});

export class DeliveryController {
    private deliveryUsecase = new deliveryUseCase();

    async send(request: FastifyRequest, reply: FastifyReply) {
        try {
            const parsed = sendNotificationSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({
                    error: "Invalid request body",
                    details: parsed.error,
                });
            }
            console.log("oioiooi")
            const notification = await this.deliveryUsecase.sendNotification(parsed.data);

            return reply.status(201).send(notification);
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ error: error.message })
            }
            return reply.status(500).send({ error: "Internal server error" });

        }
    }


}