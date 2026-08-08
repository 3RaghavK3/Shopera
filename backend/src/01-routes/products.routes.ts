import { Router } from "express";
import * as productsController from "../03-controllers/products.controller.js";
import validate from "../02-middleware/validation.js";
import { searchSchema, getProductsSchema } from "../06-validations/products.validation.js";

const router = Router();

router.get("/search", validate(searchSchema, "query"), productsController.searchProducts);
router.get("/", validate(getProductsSchema, "query"), productsController.getProducts);

export default router;
