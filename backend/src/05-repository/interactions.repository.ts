import pool from "../config/db.js";

export const trackInteractionsAtomic = async (
  userId: number,
  subcategoryId: number | null,
  attributes: any[],
  clicks: number,
  viewTime: number,
  addToCartCount: number,
  purchaseCount: number,
  scoreDelta: number
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (subcategoryId) {
      // 1. Update subcategory history
      await client.query(
        `
        INSERT INTO user_subcategory_history 
          (user_id, subcategory_id, clicks, view_time, add_to_cart_count, purchase_count, score, last_interaction_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        ON CONFLICT (user_id, subcategory_id) DO UPDATE SET
          clicks = user_subcategory_history.clicks + EXCLUDED.clicks,
          view_time = user_subcategory_history.view_time + EXCLUDED.view_time,
          add_to_cart_count = user_subcategory_history.add_to_cart_count + EXCLUDED.add_to_cart_count,
          purchase_count = user_subcategory_history.purchase_count + EXCLUDED.purchase_count,
          score = user_subcategory_history.score + EXCLUDED.score,
          last_interaction_at = now()
        `,
        [userId, subcategoryId, clicks, viewTime, addToCartCount, purchaseCount, scoreDelta]
      );
      
      // 2. Update attribute history
      for (const attr of attributes) {
        if (attr.attribute_id && attr.attribute_value) {
          await client.query(
            `
            INSERT INTO user_attribute_history 
              (user_id, subcategory_id, attribute_id, attribute_value, clicks, view_time, add_to_cart_count, purchase_count, score, last_interaction_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
            ON CONFLICT (user_id, subcategory_id, attribute_id, attribute_value) DO UPDATE SET
              clicks = user_attribute_history.clicks + EXCLUDED.clicks,
              view_time = user_attribute_history.view_time + EXCLUDED.view_time,
              add_to_cart_count = user_attribute_history.add_to_cart_count + EXCLUDED.add_to_cart_count,
              purchase_count = user_attribute_history.purchase_count + EXCLUDED.purchase_count,
              score = user_attribute_history.score + EXCLUDED.score,
              last_interaction_at = now()
            `,
            [userId, subcategoryId, attr.attribute_id, attr.attribute_value, clicks, viewTime, addToCartCount, purchaseCount, scoreDelta]
          );
        }
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getTopSubcategories = async (userId: number, limit: number = 5) => {
  const result = await pool.query(
    `SELECT subcategory_id, score
     FROM user_subcategory_history
     WHERE user_id = $1
     ORDER BY score DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const getTopAttributes = async (userId: number, subcategoryId: number, limit: number = 5) => {
  const result = await pool.query(
    `SELECT attribute_id, attribute_value, score
     FROM user_attribute_history
     WHERE user_id = $1 AND subcategory_id = $2
     ORDER BY score DESC
     LIMIT $3`,
    [userId, subcategoryId, limit]
  );
  return result.rows;
};
