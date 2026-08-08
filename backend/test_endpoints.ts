import pool from './src/config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:3000/api';

async function logHistory(label: string) {
  const subRes = await pool.query(`SELECT subcategory_id, clicks, score FROM user_subcategory_history`);
  const attrRes = await pool.query(`SELECT attribute_id, attribute_value, score FROM user_attribute_history`);
  console.log(`\n--- DB STATE: ${label} ---`);
  console.log('Subcategory History:', subRes.rows.length ? subRes.rows : 'Empty');
  console.log('Attribute History:', attrRes.rows.length ? attrRes.rows : 'Empty');
  console.log('-----------------------------\n');
}

async function makeRequest(endpoint: string, method: string, body: any, token: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `accessToken=${token}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${await response.text()}`);
  }
  return response.json();
}

async function testEndpoints() {
  try {
    // 1. Setup DB Data
    console.log('Truncating tables...');
    await pool.query('TRUNCATE TABLE user_subcategory_history CASCADE;');
    await pool.query('TRUNCATE TABLE user_attribute_history CASCADE;');

    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ('endpoint_tester@example.com', 'hash', 'Test User')
       ON CONFLICT (email) DO UPDATE SET allows_personalization = true
       RETURNING user_id, email`
    );
    const user = userRes.rows[0];

    // Create a product to test with
    await pool.query(
      `INSERT INTO subcategories (subcategory_id, subcategory_name) VALUES (8888, 'Endpoint Subcat') ON CONFLICT DO NOTHING;`
    );
    await pool.query(
      `INSERT INTO products (product_id, name, price, stock, category_id, subcategory_id)
       VALUES (8888, 'Endpoint Prod', 10, 100, 1, 8888)
       ON CONFLICT DO NOTHING;`
    );
    await pool.query(
      `INSERT INTO attribute_definitions (attribute_id, subcategory_id, attribute_name, datatype)
       VALUES (88, 8888, 'TestAttr', 'string') ON CONFLICT DO NOTHING;`
    );
    await pool.query(
      `INSERT INTO product_attributes (product_id, attribute_id, attribute_value)
       VALUES (8888, 88, 'Val') ON CONFLICT DO NOTHING;`
    );

    // 2. Generate valid JWT Token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: "15m" }
    );

    // 3. Test the endpoints
    
    // --- Test 1: Tracking ON ---
    console.log('[TEST 1] Testing /interactions/track (Tracking ON)');
    const res1 = await makeRequest('/interactions/track', 'POST', {
      product_id: 8888,
      interaction_type: 'click'
    }, token);
    console.log('API Response:', res1);
    await logHistory('After 1 click via API');

    // --- Test 2: Turn Tracking OFF ---
    console.log('[TEST 2] Testing /users/personalization (Turn Tracking OFF)');
    const res2 = await makeRequest('/users/personalization', 'PATCH', {
      allows_personalization: false
    }, token);
    console.log('API Response:', res2);

    console.log('[TEST 3] Testing /interactions/track (Tracking OFF)');
    const res3 = await makeRequest('/interactions/track', 'POST', {
      product_id: 8888,
      interaction_type: 'add_to_cart'
    }, token);
    console.log('API Response:', res3);
    await logHistory('After add_to_cart via API (Should NOT be tracked)');

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    process.exit(0);
  }
}

testEndpoints();
