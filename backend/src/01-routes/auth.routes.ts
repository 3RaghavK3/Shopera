import { Router } from "express";
import * as authController from "../03-controllers/auth.controller.js"
import validate from "../02-middleware/validation.js";
import { signupSchema } from "../06-validations/auth.validation.js";
const router = Router();

router.post("/signup",validate(signupSchema),authController.signup);

router.post("/signup/verify-otp", authController.verifyOtp);

router.post("/signup/resend-otp", authController.resendOtp);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post("/oauth/:authProvider", authController.oauth);

router.post("/forgot-password", authController.forgotPassword);

router.post("/forgot-password/verify-otp",authController.verifyForgotOtp);

router.post("/forgot-password/resend-otp",authController.resendForgotOtp);

router.post("/reset-password", authController.resetPassword);

router.post("/logout", authController.logout);

export default router;