import pool from './src/config/db.js';
import * as interactionsService from './src/04-services/interactions.service.js';
import * as usersService from './src/04-services/users.service.js';

async function logHistory(userId: number, label: string) {
  const subRes = await pool.query(
    `SELECT subcategory_id, clicks, view_time, add_to_cart_count, purchase_count, score 
     FROM user_subcategory_history WHERE user_id = $1 ORDER BY subcategory_id`,
    [userId]
  );
  const attrRes = await pool.query(
    `SELECT subcategory_id, attribute_id, attribute_value, score 
     FROM user_attribute_history WHERE user_id = $1 ORDER BY subcategory_id`,
    [userId]
  );
  
  console.log(`\n--- DB STATE: ${label} ---`);
  console.log('Subcategory History:', subRes.rows.length ? subRes.rows : 'Empty');
  console.log('Attribute History:', attrRes.rows.length ? attrRes.rows : 'Empty');
  console.log('-----------------------------\n');
}

async function test() {
  try {
    // 1. Setup a test user
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ('test_comprehensive@example.com', 'hash', 'Test User')
       ON CONFLICT (email) DO UPDATE SET allows_personalization = true
       RETURNING user_id`
    );
    const userId = userRes.rows[0].user_id;

    // Clear previous history for this user
    await pool.query(`DELETE FROM user_subcategory_history WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM user_attribute_history WHERE user_id = $1`, [userId]);

    // 2. Setup Data: 2 Subcategories, 2 Products
    await pool.query(
      `INSERT INTO subcategories (subcategory_id, subcategory_name) VALUES 
       (1001, 'Laptops'), (1002, 'Phones') 
       ON CONFLICT DO NOTHING;`
    );

    // Product 1: Laptop
    const prod1Res = await pool.query(
      `INSERT INTO products (product_id, name, description, price, stock, category_id, subcategory_id)
       VALUES (9001, 'MacBook', 'Laptop', 1000, 10, 1, 1001)
       ON CONFLICT (product_id) DO UPDATE SET subcategory_id = 1001
       RETURNING product_id`
    );
    const prod1Id = prod1Res.rows[0].product_id;

    // Product 2: Phone
    const prod2Res = await pool.query(
      `INSERT INTO products (product_id, name, description, price, stock, category_id, subcategory_id)
       VALUES (9002, 'iPhone', 'Phone', 800, 20, 1, 1002)
       ON CONFLICT (product_id) DO UPDATE SET subcategory_id = 1002
       RETURNING product_id`
    );
    const prod2Id = prod2Res.rows[0].product_id;

    // Setup Attributes for Product 1 (Laptop)
    // 1. Define the attribute (Brand)
    await pool.query(
      `INSERT INTO attribute_definitions (attribute_id, subcategory_id, attribute_name, datatype)
       VALUES (99, 1001, 'Brand', 'string') ON CONFLICT DO NOTHING;`
    );
    // 2. Assign attribute to Product 1
    await pool.query(
      `INSERT INTO product_attributes (product_id, attribute_id, attribute_value)
       VALUES (9001, 99, 'Apple') ON CONFLICT DO NOTHING;`
    );

    console.log(`Setup complete. UserId: ${userId}, Prod1(Laptop): ${prod1Id}, Prod2(Phone): ${prod2Id}`);

    // --- CASE 1: Tracking OFF ---
    console.log('\n[TEST CASE 1: Tracking OFF]');
    await usersService.updatePersonalization(userId, false);
    await interactionsService.trackInteraction(userId, prod1Id, 'click');
    await logHistory(userId, "After click with tracking OFF");

    // --- CASE 2: Tracking ON - Basic Click ---
    console.log('\n[TEST CASE 2: Tracking ON - Single Click]');
    await usersService.updatePersonalization(userId, true);
    await interactionsService.trackInteraction(userId, prod1Id, 'click'); // score = 1
    await logHistory(userId, "After 1 click on Laptop (Prod 1)");

    // --- CASE 3: Populating Same Item Again (UPSERT behavior) ---
    console.log('\n[TEST CASE 3: Same Item Again (Add to Cart)]');
    await interactionsService.trackInteraction(userId, prod1Id, 'add_to_cart'); // score = +5
    await logHistory(userId, "After adding Laptop to cart (Expect Clicks: 1, Cart: 1, Score: 6)");

    // --- CASE 4: Populating Different Item ---
    console.log('\n[TEST CASE 4: Different Item (Purchase)]');
    await interactionsService.trackInteraction(userId, prod2Id, 'purchase'); // score = +10
    await logHistory(userId, "After purchasing Phone (Prod 2)");

    // --- CASE 5: Invalid Input ---
    console.log('\n[TEST CASE 5: Invalid Input (Non-existent product)]');
    try {
      await interactionsService.trackInteraction(userId, 999999, 'click');
      console.log('FAIL: Should have thrown an error for invalid product.');
    } catch (e: any) {
      console.log('SUCCESS: Caught expected error ->', e.message);
    }
    
    console.log('\nAll tests executed successfully.');
  } catch (error) {
    console.error('\nTest error:', error);
  } finally {
    process.exit(0);
  }
}

test();
