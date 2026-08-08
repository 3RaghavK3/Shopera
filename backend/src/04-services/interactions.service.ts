import * as interactionsRepository from "../05-repository/interactions.repository.js";
import * as usersRepository from "../05-repository/users.repository.js";
import * as productsRepository from "../05-repository/products.repository.js";
import AppError from "../utils/AppError.js";
import { connection as redis } from "../config/bullmqRedis.js";

export const trackInteraction = async (
  userId: number,
  productId: number,
  interactionType: "click" | "view" | "add_to_cart" | "purchase",
  viewTime: number = 0
) => {
  // Check if tracking is allowed for the user
  const allowsTracking = await usersRepository.getPersonalizationPreference(userId);
  if (!allowsTracking) {
    return;
  }

  // Fetch product info to get subcategory and attributes
  const product = await productsRepository.getProductById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const subcategoryId = product.subcategory_id;
  const attributes = product.attributes || [];

  let clicks = 0;
  let timeViewed = 0;
  let addToCartCount = 0;
  let purchaseCount = 0;
  let scoreDelta = 0;

  switch (interactionType) {
    case "click":
      clicks = 1;
      scoreDelta = 1;
      break;
    case "view":
      timeViewed = viewTime;
      scoreDelta = Math.floor(viewTime / 10);
      break;
    case "add_to_cart":
      addToCartCount = 1;
      scoreDelta = 5;
      break;
    case "purchase":
      purchaseCount = 1;
      scoreDelta = 10;
      break;
  }

  // Update subcategory and attribute history atomically
  await interactionsRepository.trackInteractionsAtomic(
    userId,
    subcategoryId,
    attributes,
    clicks,
    timeViewed,
    addToCartCount,
    purchaseCount,
    scoreDelta
  );
};

export const getTopSubcategories = async (userId: number, limit: number = 5) => {
  return await interactionsRepository.getTopSubcategories(userId, limit);
};

export const getTopAttributes = async (
  userId: number,
  subcategoryId: number,
  limit: number = 5
) => {
  return await interactionsRepository.getTopAttributes(userId, subcategoryId, limit);
};

export const computeAndCacheRecommendations = async (userId: number, totalLimit: number = 12) => {
  const topSubcategories = await interactionsRepository.getTopSubcategories(userId, 3);
  
  if (topSubcategories.length === 0) {
    return []; 
  }
  
  const products = [];
  const limitPerSubcat = Math.ceil(totalLimit / topSubcategories.length);
  
  for (const subcat of topSubcategories) {
    // Get top 5 attributes for the scoring engine
    const topAttrs = await interactionsRepository.getTopAttributes(userId, subcat.subcategory_id, 5);
    
    const formattedAttributes = topAttrs.map(attr => ({
      id: attr.attribute_id,
      value: attr.attribute_value
    }));
    
    const subcatProducts = await productsRepository.getScoredProductsByAttributes(
      subcat.subcategory_id,
      formattedAttributes,
      limitPerSubcat
    );
    
    products.push(...subcatProducts);
  }
  
  const finalProducts = products.slice(0, totalLimit);
  
  // Cache in Redis for 24 hours
  await redis.setex(`user:${userId}:recommendations`, 86400, JSON.stringify(finalProducts));
  
  return finalProducts;
};

export const getRecommendations = async (userId: number, totalLimit: number = 12) => {
  const cached = await redis.get(`user:${userId}:recommendations`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fallback if not computed yet
  return await computeAndCacheRecommendations(userId, totalLimit);
};
