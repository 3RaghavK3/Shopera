import dotenv from "dotenv";
dotenv.config();

import pool from "../config/db.js";
import { trackInteraction } from "../04-services/interactions.service.js";
import * as interactionsRepository from "../05-repository/interactions.repository.js";

async function run() {
  try {
    // Get a user
    const userRes = await pool.query('SELECT user_id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log("No users found");
      return;
    }
    const userId = userRes.rows[0].user_id;
    console.log(`Using user ID: ${userId}`);

    // Clean existing interactions for this user to start fresh
    await pool.query('DELETE FROM user_attribute_history WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_subcategory_history WHERE user_id = $1', [userId]);
    console.log("Cleared old interactions.");

    // Get products
    const productsRes = await pool.query('SELECT product_id, subcategory_id FROM products LIMIT 100');
    if (productsRes.rows.length === 0) {
      console.log("No products found");
      return;
    }
    const products = productsRes.rows;

    // Pick 5 subcategories to visit with different intensities
    const subcats = [...new Set(products.map(p => p.subcategory_id))];
    const s1 = subcats[0];
    const s2 = subcats[1];
    const s3 = subcats[2];
    const s4 = subcats[3];
    const s5 = subcats[4];
    console.log(`Subcategories targeted: ${s1} (Very Heavy), ${s2} (Heavy), ${s3} (Medium), ${s4} (Light), ${s5} (Noise)`);

    const p1 = products.filter(p => p.subcategory_id === s1);
    const p2 = products.filter(p => p.subcategory_id === s2);
    const p3 = products.filter(p => p.subcategory_id === s3);
    const p4 = products.filter(p => p.subcategory_id === s4);
    const p5 = products.filter(p => p.subcategory_id === s5);

    const simulate = async (prods: any[], count: number, purchaseChance: number) => {
      if (prods.length === 0) return;
      for (let i = 0; i < count; i++) {
        const p = prods[Math.floor(Math.random() * prods.length)];
        await trackInteraction(userId, p.product_id, "click");
        await trackInteraction(userId, p.product_id, "view", 120 + Math.floor(Math.random() * 100)); 
        
        if (Math.random() < purchaseChance) {
          await trackInteraction(userId, p.product_id, "purchase");
        }
      }
    };

    console.log("Simulating interactions...");
    await simulate(p1, 40, 0.3); // Very Heavy
    await simulate(p2, 25, 0.15); // Heavy
    await simulate(p3, 10, 0.05); // Medium
    await simulate(p4, 3, 0);   // Light
    await simulate(p5, 1, 0);   // Noise

    console.log("Interactions generated.");

    // Now test the retrieval
    const topSubcats = await interactionsRepository.getTopSubcategories(userId, 5);
    console.log("\n--- Top Subcategories ---");
    console.log(topSubcats);

    if (topSubcats.length > 0) {
      const topSubcatId = topSubcats[0].subcategory_id;
      console.log(`\n--- Top Attributes for Subcategory ${topSubcatId} ---`);
      const topAttrs = await interactionsRepository.getTopAttributes(userId, topSubcatId, 5);
      console.log(topAttrs);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

run();
