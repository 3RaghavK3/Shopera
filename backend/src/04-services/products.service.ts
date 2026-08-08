import * as productsRepository from "../05-repository/products.repository.js";
import { GetProductsQuery } from "../06-validations/products.validation.js";

export const searchProducts = async (query: string) => {
  return await productsRepository.searchProducts(query);
};

export const getProducts = async (filters: GetProductsQuery) => {
  return await productsRepository.getProducts(filters);
};

export const getProductById = async (product_id: number) => {
  return await productsRepository.getProductById(product_id);
};
