import { Router } from "express";
import { authenticate } from "../02-middleware/authenticate.js";
import validate from "../02-middleware/validation.js";
import * as usersController from "../03-controllers/users.controller.js";
import * as usersValidation from "../06-validations/users.validation.js";

const router = Router();

router.patch(
  "/personalization",
  authenticate,
  validate(usersValidation.updatePersonalizationSchema),
  usersController.updatePersonalization
);

router.get(
  "/personalization",
  authenticate,
  usersController.getPersonalization
);

export default router;
