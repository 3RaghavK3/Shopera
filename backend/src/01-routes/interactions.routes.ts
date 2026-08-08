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

export default router;
