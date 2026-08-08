import * as interactionsRepository from "../05-repository/interactions.repository.js";
import * as usersRepository from "../05-repository/users.repository.js";
import * as productsRepository from "../05-repository/products.repository.js";
import AppError from "../utils/AppError.js";

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
