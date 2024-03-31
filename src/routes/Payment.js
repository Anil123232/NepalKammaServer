import express from "express";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import {
  createPayment,
  getPaymentByProvider,
  requestPayment,
} from "../domains/payment/controller/index.js";
const router = express.Router();

router
  .route("/createPayment")
  .post(protect, permission(["job_provider"]), createPayment);

router
  .route("/getPaymentByProvider")
  .get(protect, permission(["job_seeker"]), getPaymentByProvider);

router
  .route("/requestPayment/:id")
  .put(protect, permission(["job_seeker"]), requestPayment);

export default router;
