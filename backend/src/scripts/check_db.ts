import dotenv from "dotenv";
dotenv.config();
import pool from "../config/db.js";

async function run() {
  const result = await pool.query('SELECT * FROM user_subcategory_history LIMIT 5');
  console.log("Subcategories:", result.rows);
  const result2 = await pool.query('SELECT * FROM user_attribute_history LIMIT 5');
  console.log("Attributes:", result2.rows);
  process.exit(0);
}
run();
