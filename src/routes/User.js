import express from "express";
import {
  createUser,
  resendOTP,
  verifyUser,
  LoginUser,
} from "../domains/user/controller/index.js";
import {
  loginValidation,
  signUpValidation,
  signupValidationResult,
} from "../validators/UserValidators.js";
const router = express.Router();

router
  .route("/signup")
  .post(signUpValidation, signupValidationResult, createUser);
// verify otp route
router.route("/verify").post(verifyUser);
//resend otp route
router.route("/resend-otp").post(resendOTP);
router.route("/login").post(loginValidation, signupValidationResult, LoginUser);

export default router;
