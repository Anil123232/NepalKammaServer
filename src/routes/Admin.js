import express from "express";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import { getAllFreelancers } from "../domains/admin/controller/index.js";
const router = express.Router();

router
  .route("/getAllFreelancers")
  .get(protect, permission(["admin"]), getAllFreelancers);

export default router;
