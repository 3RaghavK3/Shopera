import pool from "../config/db.js";

async function checkProducts() {
  try {
    const res = await pool.query("SELECT product_id, category_id, subcategory_id, name FROM products LIMIT 5;");
    console.log("Products in DB:");
    console.log(JSON.stringify(res.rows, null, 2));
    
    const attrRes = await pool.query("SELECT * FROM product_attributes LIMIT 5;");
    console.log("Product Attributes in DB:");
    console.log(JSON.stringify(attrRes.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
