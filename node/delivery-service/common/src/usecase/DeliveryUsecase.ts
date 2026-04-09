import axios from "axios";
import { db } from "../db/db";
import { SendNotification } from "../entities/Delivery";

export class deliveryUseCase {
    async sendNotification(orderData: SendNotification) {
        console.log("notification_id:", orderData.notification_id);

        try {
            const result = await db.query(
                `UPDATE notifications
                 SET status = 'SENT', sent_at = NOW()
                 WHERE id = $1
                 RETURNING id, user_id, order_id, message, status, created_at, sent_at`,
                [orderData.notification_id]
            );

            console.log("rowCount:", result.rowCount);
            console.log("rows:", result.rows);

            return result.rows[0];
        } catch (error) {
            console.error("Erro ao atualizar notificação:", error);

            if (error instanceof Error) {
                throw new Error(error.message);
            }

            throw new Error("Unknown error while updating notification");
        }
    }
}