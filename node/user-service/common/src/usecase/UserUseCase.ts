import { CreateUsuarioRequest, CreateUsuarioResponse } from "../entities/User";
import { db } from "../db/db";


export class UserUseCase {
    async createUser(userData: CreateUsuarioRequest): Promise<CreateUsuarioResponse> {
        const result = await db.query(
            `SELECT 1 FROM users WHERE email = $1 OR name = $2`,
            [userData.email, userData.name]
        );
        if (result.rows.length > 0) {
            throw new Error("Email ou username já estão sendo utilizados");
        }
        const create = await db.query(`insert into users (name, email) values ($1, $2) returning id`
            , [userData.name, userData.email]
        );
        return create.rows[0];
    }

    async execute(email: string) {
        const result = await db.query(
            `SELECT id, name, email, created_at
            FROM users
            WHERE email = $1`,
            [email]
        );

        return result.rows[0] || null;
    }

}