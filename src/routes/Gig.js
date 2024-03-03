import express from "express";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import { createGig, getGig, uploadImages } from "../domains/gigs/controller/index.js";
import {
  createGigValidation,
  createGigValidationResult,
} from "../validators/GigValidators.js";
import { multipleUpload } from "../domains/auth/middlewares/Multer.js";
const router = express.Router();

router
  .route("/creategig/:id")
  .put(
    protect,
    permission(["job_seeker"]),
    createGigValidation,
    createGigValidationResult,
    createGig
  );

router
  .route("/upload-photo")
  .post(protect, multipleUpload, permission(["job_seeker"]), uploadImages);

router.route("/").get(protect, getGig);

export default router;
