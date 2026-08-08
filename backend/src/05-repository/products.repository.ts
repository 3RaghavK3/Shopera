import pool from "../config/db.js";
import { GetProductsQuery } from "../06-validations/products.validation.js";

export const searchProducts = async (query: string) => {
  const client = await pool.connect();
  try {
    await client.query("SET pg_trgm.similarity_threshold = 0.15");

    const result = await client.query(
      `
      SELECT 
        product_id, 
        name,
        similarity(name, $1) as similarity_score
      FROM products
      WHERE name % $1
      ORDER BY similarity_score DESC
      LIMIT 5
      `,
      [query]
    );

    await client.query("SET pg_trgm.similarity_threshold = 0.3");
    return result.rows;
  } finally {
    client.release();
  }
};
export const getProducts = async (filters: GetProductsQuery) => {
  const {
    page,
    limit,
    category_id,
    subcategory_id,
    min_price,
    max_price,
    min_rating,
    attributes
  } = filters;

  const offset = (page! - 1) * limit!;

  let queryText = `
    SELECT 
      product_id, 
      category_id, 
      subcategory_id, 
      name, 
      product_url, 
      price, 
      rating, 
      total_ratings, 
      image_url, 
      stock
    FROM products p
    WHERE 1=1
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (category_id !== undefined) {
    queryText += ` AND p.category_id = $${paramIndex++}`;
    queryParams.push(category_id);
  }

  if (subcategory_id !== undefined) {
    queryText += ` AND p.subcategory_id = $${paramIndex++}`;
    queryParams.push(subcategory_id);
  }

  if (min_price !== undefined) {
    queryText += ` AND p.price >= $${paramIndex++}`;
    queryParams.push(min_price);
  }

  if (max_price !== undefined) {
    queryText += ` AND p.price <= $${paramIndex++}`;
    queryParams.push(max_price);
  }

  if (min_rating !== undefined) {
    queryText += ` AND p.rating >= $${paramIndex++}`;
    queryParams.push(min_rating);
  }

  if (attributes) {
    const attrsArray = Array.isArray(attributes) ? attributes : [attributes];
    for (const attrStr of attrsArray) {
      const parts = attrStr.split(':');
      if (parts.length === 2) {
        const attrId = parseInt(parts[0], 10);
        const attrValues = parts[1].split(',').map(v => v.trim()).filter(Boolean);

        if (!isNaN(attrId) && attrValues.length > 0) {
          queryText += `
            AND EXISTS (
              SELECT 1 FROM product_attributes pa
              WHERE pa.product_id = p.product_id
              AND pa.attribute_id = $${paramIndex++}
              AND pa.attribute_value = ANY($${paramIndex++})
            )
          `;
          queryParams.push(attrId);
          queryParams.push(attrValues);
        }
      }
    }
  }

  queryText += ` ORDER BY p.product_id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit);
  queryParams.push(offset);

  const result = await pool.query(queryText, queryParams);
  return result.rows;
};

export const getProductById = async (product_id: number) => {
  const queryText = `
    SELECT 
      p.product_id, 
      p.category_id, 
      p.subcategory_id, 
      p.name, 
      p.product_url, 
      p.price, 
      p.rating, 
      p.total_ratings, 
      p.image_url, 
      p.description,
      p.stock,
      COALESCE(
        json_agg(
          json_build_object(
            'attribute_id', pa.attribute_id,
            'attribute_name', ad.attribute_name,
            'attribute_value', pa.attribute_value
          )
        ) FILTER (WHERE pa.attribute_id IS NOT NULL),
        '[]'
      ) as attributes
    FROM products p
    LEFT JOIN product_attributes pa ON p.product_id = pa.product_id
    LEFT JOIN attribute_definitions ad ON pa.attribute_id = ad.attribute_id
    WHERE p.product_id = $1
    GROUP BY p.product_id;
  `;
  const result = await pool.query(queryText, [product_id]);
  return result.rows[0] || null;
};
