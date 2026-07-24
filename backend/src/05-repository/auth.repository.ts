import pool from "../config/db.js";

export async function findUserByEmail(email: string) {
    const result = await pool.query(
        `select *from users where email = $1 limit 1;`,[email]
    );

    return result.rows[0] ?? null;
}

export async function createUser(
    email: string,
    name: string,
    password: string
) {
    const result = await pool.query(
        `insert into users (name, email, password_hash) values ($1, $2, $3) returning *`,[name, email, password]
    );

    return result.rows[0];
}