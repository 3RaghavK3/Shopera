import { Router } from "express";
import { authenticate } from "../02-middleware/authenticate.js";
import validate from "../02-middleware/validation.js";
import * as interactionsController from "../03-controllers/interactions.controller.js";
import * as interactionsValidation from "../06-validations/interactions.validation.js";

const router = Router();

router.post(
  "/track",
  authenticate,
  validate(interactionsValidation.trackInteractionSchema),
  interactionsController.trackInteraction
);

router.get(
  "/top-subcategories",
  authenticate,
  validate(interactionsValidation.getTopSubcategoriesSchema, "query"),
  interactionsController.getTopSubcategories
);

router.get(
  "/top-attributes/:subcategoryId",
  authenticate,
  validate(interactionsValidation.getTopAttributesSchema, "params"),
  interactionsController.getTopAttributes
);

router.get(
  "/recommendations",
  authenticate,
  validate(interactionsValidation.getRecommendationsSchema, "query"),
  interactionsController.getRecommendations
);

export default router;
