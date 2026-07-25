import pool from "../config/db.js";

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    `select * from users where email = $1 limit 1;`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  const result = await pool.query(
    `insert into users (name, email, password_hash) values ($1, $2, $3) returning *`,
    [name, email, passwordHash],
  );

  return result.rows[0];
}

export async function setPassword(email: string, passwordHash: string) {
  const result = await pool.query(
    `update users set password_hash = $1 where email = $2 returning *`,
    [passwordHash, email]
  );
  return result.rows[0];
}
