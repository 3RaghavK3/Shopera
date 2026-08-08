import dotenv from "dotenv";
dotenv.config();

import pool from "../config/db.js";
import { getRecommendations } from "../04-services/interactions.service.js";
import * as interactionsRepository from "../05-repository/interactions.repository.js";
import { connection as redis } from "../config/bullmqRedis.js";

async function run() {
  try {
    const userRes = await pool.query('SELECT user_id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log("No users found");
      return;
    }
    const userId = userRes.rows[0].user_id;
    console.log(`Using user ID: ${userId}`);

    // Delete cache first to force recomputation
    await redis.del(`user:${userId}:recommendations`);
    console.log("Cleared Redis cache.");

    // Print their actual top subcategories and attributes to understand the inputs
    console.log("\n--- USER'S TRUE PREFERENCES ---");
    const topSubcategories = await interactionsRepository.getTopSubcategories(userId, 3);
    console.log("Top Subcategories:", topSubcategories);
    
    for (const subcat of topSubcategories) {
      const topAttrs = await interactionsRepository.getTopAttributes(userId, subcat.subcategory_id, 5);
      console.log(`Top Attributes for Subcategory ${subcat.subcategory_id}:`, topAttrs.map(a => ({ id: a.attribute_id, value: a.attribute_value, score: a.score })));
    }

    console.log("\n--- GENERATING RECOMMENDATIONS ---");
    const recs = await getRecommendations(userId, 12);
    
    console.log(`Found ${recs.length} recommended products.`);
    
    // Group them by subcategory for easier viewing
    const grouped: any = {};
    for (const p of recs) {
      if (!grouped[p.subcategory_id]) grouped[p.subcategory_id] = [];
      grouped[p.subcategory_id].push({
        id: p.product_id,
        name: p.name,
        // if the repo returns match_score, it'll be here
        match_score: (p as any).match_score,
      });
    }

    console.log("\n--- RECOMMENDED PRODUCTS (Scored) ---");
    console.dir(grouped, { depth: null });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
    redis.quit();
  }
}

run();
