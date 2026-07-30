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


export async function setPassword(
   email:string,
   passwordHash:string
){

  const result=await pool.query(
    `update users set password_hash=$1 where email=$2`,[passwordHash,email]
  )
}

export async function setToken(
  userId: number,
  hashedRefreshToken: string,
) {
  await pool.query(
    `insert into refresh_tokens (user_id,token_hash) values ($1, $2)`,
    [userId, hashedRefreshToken]
  );
}

export async function getToken(hashedRefreshToken:string){
    const result=await pool.query(`select * from refresh_tokens where token_hash=$1`,[hashedRefreshToken]);
    return result.rows[0]??null
}

export async function findUserById(userId: number) {
  const result = await pool.query(
    `
    select *
    from users
    where user_id = $1
    limit 1;
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function logout(hashedRefreshToken:string){
     await pool.query(`delete  from refresh_tokens where token_hash=$1`,[hashedRefreshToken])
}

export async function deleteToken(hashedRefreshToken: string) {
  await pool.query(`delete from refresh_tokens where token_hash=$1`, [hashedRefreshToken]);
}