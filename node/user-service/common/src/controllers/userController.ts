import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { CreateUsuarioRequest } from "../entities/User";
import { UserUseCase } from "../usecase/UserUseCase";

export class UserController {
    private userUseCase: UserUseCase;
    constructor() {
        this.userUseCase = new UserUseCase();
    }


    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const createUserSchema = z.object({
                name: z.string().min(1, "Nome é obrigatório"),
                email: z.email().min(1, "Email é obrigatório")
            })
            const validationResult = createUserSchema.safeParse(request.body);
            if (!validationResult.success) {
                return reply.status(400).send({
                    error: "invalid data"
                });
            }
            const createData = validationResult.data as CreateUsuarioRequest;

            if (!createData) {
                return reply.code(400).send({
                    error: 'Cannot be null'
                })
            }

            const user = await this.userUseCase.createUser(createData);

            return reply.status(201).send({
                message: 'User created sucessfully',
                user
            })
        } catch (error: any) {
            return reply.status(400).send({
                error: error.message || 'Failed to create user'
            })
        }
    }

    async getByEmail(request: FastifyRequest, reply: FastifyReply) {
        const { email } = request.query as { email?: string };

        if (!email) {
            return reply.status(400).send({ error: "email is required" });
        }

        const user = await this.userUseCase.execute(email);

        if (!user) {
            return reply.status(404).send({ error: "user not found" });
        }

        return reply.send(user);
    }


}