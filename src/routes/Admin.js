import express from "express";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import {
  completedPayment,
  countAll,
  getAllFreelancers,
  getAllJobProviders,
  getAllJobs,
  getAllPayments,
} from "../domains/admin/controller/index.js";
const router = express.Router();

router.route("/countAll").get(protect, permission(["admin"]), countAll);

router
  .route("/getAllFreelancers")
  .get(protect, permission(["admin"]), getAllFreelancers);

router
  .route("/getAllJobProviders")
  .get(protect, permission(["admin"]), getAllJobProviders);

router
  .route("/getAllPayments")
  .get(protect, permission(["admin"]), getAllPayments);

router.route("/getAllJobs").get(protect, permission(["admin"]), getAllJobs);

router
  .route("/completedPayment/:paymentId")
  .put(protect, permission(["admin"]), completedPayment);

export default router;
