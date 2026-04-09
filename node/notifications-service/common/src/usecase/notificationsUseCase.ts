import axios from "axios";
import { db } from "../db/db";
import { CreateNotificationRequest } from "../entities/Notification";

export class NotificationsUseCase {
    async createNotification(notificationData: CreateNotificationRequest) {

        const result = await db.query(
            `INSERT INTO notifications (user_id, order_id, message, status)
             VALUES ($1, $2, $3, 'PENDING')
             RETURNING id, user_id, order_id, message, status, created_at`,
            [notificationData.user_id, notificationData.order_id, notificationData.message]
        );

        const notification = result.rows[0];

        console.log("Notificação criada:", notification.id);

        try {
            await axios.post(
                `${process.env.DELIVERY_SERVICE_URL}/send`,
                {
                    notification_id: notification.id,
                    user_id: notification.user_id,
                    message: notification.message
                }
            );

            console.log("Delivery chamado com sucesso");

        } catch (error) {
            console.error("Erro ao chamar delivery-service:", error);
        }

        return notification;
    }
}