import express from "express";
import {
  completedJobs,
  createJob,
  getJob,
  nearBy,
  recommendationJobs,
  searchJob,
  updateJobStatus,
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
router.route(`/searchjob`).get(protect, searchJob);
//update job status
router
  .route(`/updateJobStatus/:jobId`)
  .put(protect, permission(["job_provider"]), updateJobStatus);

router.route(`/completedJobs`).get(protect, permission(["job_provider"]), completedJobs);

export default router;
