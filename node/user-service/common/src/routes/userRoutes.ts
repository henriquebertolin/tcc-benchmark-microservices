import { FastifyInstance } from "fastify";
import { db } from "../db/db";
import { UserController } from "../controllers/userController";

export async function userRoutes(app: FastifyInstance) {
    const userController = new UserController
    app.post("/users", userController.create.bind(userController))
    app.get("/users/by-email", userController.getByEmail.bind(userController))
}