import User from "../../../../models/User.js";
import catchAsync from "../../../utils/catchAsync.js";

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
    }else{
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
