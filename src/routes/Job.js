import express from "express";
import {
  createJob,
  getJob,
  nearBy,
  recommendationJobs,
} from "../domains/jobs/controller/index.js";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import {
  createJobValidation,
  createJobValidationResult,
} from "../validators/JobValidators.js";
const router = express.Router();

router
  .route("/createJob")
  .post(
    protect,
    permission(["job_provider"]),
    createJobValidation,
    createJobValidationResult,
    createJob
  );

router.route(`/`).get(protect, getJob);
router.route(`/getNearbyJob/:latitude/:longitude`).get(protect, nearBy);
router.route(`/getRecommendedJob`).get(protect, recommendationJobs);

export default router;
