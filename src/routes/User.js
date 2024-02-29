import express from "express";
import {
  createUser,
  resendOTP,
  verifyUser,
  LoginUser,
  editProfile,
  updateProfilePicController,
} from "../domains/user/controller/index.js";
import {
  loginValidation,
  signUpValidation,
  signupValidationResult,
} from "../validators/UserValidators.js";
import { protect } from "../domains/auth/middlewares/auth.js";
import { singleUpload } from "../domains/auth/middlewares/Multer.js";
const router = express.Router();

router
  .route("/signup")
  .post(signUpValidation, signupValidationResult, createUser);
// verify otp route
router.route("/verify").post(verifyUser);
//resend otp route
router.route("/resend-otp").post(resendOTP);
router.route("/login").post(loginValidation, signupValidationResult, LoginUser);

// edit profile
router.route(`/edit-profile/:id`).put(protect, editProfile);

// update profile pic
router.route("/update-picture").put(protect, singleUpload, updateProfilePicController);

export default router;
