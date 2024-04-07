import User from "../../../../models/User.js";
import Payment from "../../../../models/Payment.js";
import catchAsync from "../../../utils/catchAsync.js";
import Job from "../../../../models/Job.js";
import Gig from "../../../../models/Gig.js";

//count all freelancers, job, gigs, and job_providers
export const countAll = catchAsync(async (req, res, next) => {
  try {
    const freelancers = await User.countDocuments({ role: "job_seeker" });
    const jobProviders = await User.countDocuments({ role: "job_provider" });
    const job = await Job.countDocuments();
    const gigs = await Gig.countDocuments();
    res.status(200).json({ freelancers, jobProviders, job, gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to count all" });
  }
});

//get all freelancers
export const getAllFreelancers = catchAsync(async (req, res, next) => {
  try {
    const { verified_status, assending } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    let query = {
      role: "job_seeker",
    };

    if (verified_status) {
      query.isDocumentVerified = verified_status;
    } else {
      // If verified_status is not provided, remove the isDocumentVerified filter
      delete query.isDocumentVerified;
    }

    let sort = {};

    if (assending === "true") {
      sort.createdAt = -1;
    } else {
      sort.createdAt = 1;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const users = await User.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all freelancers" });
  }
});

//get all job providers
export const getAllJobProviders = catchAsync(async (req, res, next) => {
  try {
    const { verified_status, assending } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    let query = {
      role: "job_provider",
    };

    if (verified_status) {
      query.isDocumentVerified = verified_status;
    } else {
      // If verified_status is not provided, remove the isDocumentVerified filter
      delete query.isDocumentVerified;
    }

    let sort = {};

    if (assending === "true") {
      sort.createdAt = -1;
    } else {
      sort.createdAt = 1;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const users = await User.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all job provider" });
  }
});

//get all payments
export const getAllPayments = catchAsync(async (req, res, next) => {
  try {
    const { pending_status, assending } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    let query = {};
    if (pending_status) {
      query.paymentStatus = pending_status;
    } else {
      delete query.paymentStatus;
    }
    let sort = {};
    if (assending === "true") {
      sort.createdAt = -1;
    } else {
      sort.createdAt = 1;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const payments = await Payment.find(query)
      .populate("PaymentBy")
      .populate("PaymentTo")
      .populate({
        path: "job",
        populate: {
          path: "postedBy",
        },
      })
      .populate({
        path: "job",
        populate: {
          path: "assignedTo",
        },
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPayments = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalPayments / limit);
    res.json({ payments, currentPage: page, totalPages, totalPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all payments" });
  }
});

//get all jobs
export const getAllJobs = catchAsync(async (req, res, next) => {
  try {
    const { status, assending } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    let query = {};
    if (status) {
      query.job_status = status;
    } else {
      delete query.job_status;
    }
    let sort = {};
    if (assending === "true") {
      sort.createdAt = -1;
    } else {
      sort.createdAt = 1;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const jobs = await Job.find(query)
      .populate("assignedTo")
      .populate("postedBy")
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    res.json({ jobs, currentPage: page, totalPages, totalJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all jobs" });
  }
});

//completed payment
export const completedPayment = catchAsync(async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { freelancerId, jobProviderId, amount } = req.body;
    const freelancer = await User.findById(freelancerId);
    const jobProvider = await User.findById(jobProviderId);

    if (!freelancer || !jobProvider) {
      return res.status(404).json({ message: "User not found" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    freelancer.totalIncome += amount;
    freelancer.can_review.push({ user: jobProviderId });
    await freelancer.save();

    payment.paymentStatus = "Completed";
    await payment.save();

    jobProvider.totalAmountPaid += amount;
    if (jobProvider.mileStone % 5 === 0) {
      jobProvider.mileStone += 1;
      jobProvider.totalCompletedJobs += 1;
    } else {
      jobProvider.totalCompletedJobs += 1;
    }
    jobProvider.can_review.push({ user: freelancerId });
    await jobProvider.save();

    res.status(200).json({ message: "Payment completed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete payment" });
  }
});
