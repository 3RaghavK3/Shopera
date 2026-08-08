import { Request, Response, NextFunction } from "express";
import * as productsService from "../04-services/products.service.js";
import { ProductSearchQuery } from "../06-validations/products.validation.js";

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query as unknown as ProductSearchQuery;
    const products = await productsService.searchProducts(q);

    res.status(200).json({
      data: products
    });
  } catch (error) {
    next(error);
  }
};

import { GetProductsQuery } from "../06-validations/products.validation.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query as unknown as GetProductsQuery;
    const products = await productsService.getProducts(filters);

    res.status(200).json({
      page: filters.page,
      limit: filters.limit,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

import { GetProductByIdParams } from "../06-validations/products.validation.js";

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { product_id } = req.params as unknown as GetProductByIdParams;
    const product = await productsService.getProductById(product_id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
      return;
    }

    res.status(200).json({
      data: product
    });
  } catch (error) {
    next(error);
  }
};
