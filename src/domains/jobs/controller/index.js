import catchAsync from "../../../utils/catchAsync.js";
import Job from "../../../../models/Job.js";
import recommendJobs from "../helper/JobRecommendation.js";

//create job
export const createJob = catchAsync(async (req, res, next) => {
  console.log("hitted", req.body);
  try {
    const {
      title,
      location,
      latitude,
      longitude,
      phoneNumber,
      skills_required,
      job_description,
      payment_method,
      price,
      category,
    } = req.body;

    const jobData = new Job({
      title,
      location,
      address: {
        coordinates: [longitude, latitude],
      },
      phoneNumber,
      skills_required,
      job_description,
      payment_method,
      price,
      category,
      postedBy: req.user._id,
    });

    await jobData.save();
    res.status(201).json({ message: "Successfully! created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// get job
export const getJob = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Calculate the index of the first item for the current page
    const startIndex = (page - 1) * limit;

    // Find jobs for the current page using skip and limit
    const job = await Job.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username email")
      .skip(startIndex)
      .limit(limit)
      .exec();

    // Get total number of jobs
    const totalJobs = await Job.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / limit);

    console.log(job, totalPages, page, "hitted");

    res.status(200).json({
      job,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get job" });
  }
});

// near by
export const nearBy = catchAsync(async (req, res, next) => {
  try {
    const { latitude, longitude } = req.params;
    console.log(latitude, longitude, "hitted");

    const nearBy = await Job.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          key: "address.coordinates",
          maxDistance: parseFloat(10000),
          distanceField: "dist.calculated",
          spherical: true,
        },
      },
    ]).exec();

    // Get the ids of the documents you want to populate
    const jobIds = nearBy.map((job) => job._id);

    // Populate the referenced fields using find()
    const populatedJobs = await Job.find({ _id: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate("postedBy", "username email")
      .exec();

    res.status(200).json({ nearBy: populatedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get job" });
  }
});

//recommendation system
export const recommendationJobs = async (req, res, next) => {
  try {
    const id = req.user._id;
    if (!id) return res.status(400).json({ message: "id is required" });
    const recommendJobsList = await recommendJobs(id);

    // Get the ids of the documents you want to populate
    const jobIds = recommendJobsList.map((job) => job._id);

    // Populate the referenced fields using find()
    const populatedJobs = await Job.find({ _id: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate("postedBy", "username email")
      .exec();

    res.status(200).json({ recommendJobsList: populatedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get job" });
  }
};
