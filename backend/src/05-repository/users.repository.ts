import pool from "../config/db.js";

export const updatePersonalization = async (userId: number, allows: boolean) => {
  const result = await pool.query(
    "UPDATE users SET allows_personalization = $1 WHERE user_id = $2 RETURNING *",
    [allows, userId]
  );
  return result.rows[0];
};

export const getPersonalizationPreference = async (userId: number) => {
  const result = await pool.query(
    "SELECT allows_personalization FROM users WHERE user_id = $1",
    [userId]
  );
  return result.rows[0]?.allows_personalization ?? true;
};
