import axios from "axios";
import { db } from "../db/db";
import { CreateOrderRequest } from "../entities/Orders";

export class OrdersUseCase {
  async createOrder(orderData: CreateOrderRequest) {
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "http://localhost:3000";

    const notificationServiceUrl =
      process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3002";

    let user;

    try {
      const response = await axios.get(`${userServiceUrl}/users/by-email`, {
        params: { email: orderData.userEmail },
      });

      user = response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }

    const result = await db.query(
      `INSERT INTO orders (user_id, amount, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, amount, description, status, created_at`,
      [user.id, orderData.amount, orderData.description, "CREATED"]
    );

    const order = result.rows[0];

    try {
      await axios.post(`${notificationServiceUrl}/notifications`, {
        user_id: order.user_id,
        order_id: order.id,
        message: "Seu pedido foi criado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }

    return order;
  }
}