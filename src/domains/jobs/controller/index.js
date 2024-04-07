import catchAsync from "../../../utils/catchAsync.js";
import Job from "../../../../models/Job.js";
import recommendJobs from "../helper/JobRecommendation.js";
import NotificationModel from "../../../../models/Notification.js";
import User from "../../../../models/User.js";
import { emitNotification } from "../../../../socketHandler.js";

//create job
export const createJob = catchAsync(async (req, res, next) => {
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

    // Create notifications for job seekers with matching skills
    const jobSeekers = await User.find({
      role: "job_seeker",
      skills: { $in: skills_required },
    });

    const notifications = await Promise.all(
      jobSeekers.map(async (jobSeeker) => {
        const sender = await User.findById(req.user._id);
        return {
          senderId: req.user._id,
          senderUsername: sender.username,
          senderProfilePic: sender.profilePic?.url,
          recipientId: jobSeeker._id,
          jobId: jobData._id,
          notification: `${title} - ${job_description}`,
          type: "job_posted",
          onlineStatus: sender.onlineStatus,
        };
      })
    );
    await NotificationModel.insertMany(notifications);
    notifications.forEach((notification) => {
      if (notification.onlineStatus) {
        emitNotification(req.io, notification.recipientId.toString(), {
          senderId: notification.senderId,
          recipientId: notification.recipientId,
          notification: notification.notification,
          profilePic: notification.senderProfilePic,
          senderUsername: notification.senderUsername,
          type: "job_posted",
        });
      }
    });

    // Create notifications for nearby job seekers
    const nearbyJobSeekers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          key: "address.coordinates",
          maxDistance: 10000, // 10km
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: {
          role: "job_seeker",
        },
      },
    ]);

    const locationNotifications = await Promise.all(
      nearbyJobSeekers.map(async (jobSeeker) => {
        const sender = await User.findById(req.user._id);
        return {
          senderId: req.user._id,
          senderUsername: sender.username,
          senderProfilePic: sender.profilePic?.url,
          recipientId: jobSeeker._id,
          jobId: jobData._id,
          notification: `${title} - ${job_description}`,
          type: "job_posted_location",
          onlineStatus: sender.onlineStatus,
        };
      })
    );
    await NotificationModel.insertMany(locationNotifications);
    locationNotifications.forEach((notification) => {
      if (notification.onlineStatus) {
        emitNotification(req.io, notification.recipientId.toString(), {
          senderId: notification.senderId,
          recipientId: notification.recipientId,
          notification: notification.notification,
          profilePic: notification.senderProfilePic,
          senderUsername: notification.senderUsername,
          type: "job_posted_location",
        });
      }
    });

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
      .populate("postedBy", "username email profilePic onlineStatus can_review")
      .skip(startIndex)
      .limit(limit)
      .exec();

    // Get total number of jobs
    const totalJobs = await Job.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      job,
      totalPages,
      totalJobs,
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
      .populate("postedBy", "username email profilePic onlineStatus can_review")
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
      .populate("postedBy", "username email profilePic onlineStatus can_review")
      .exec();

    res.status(200).json({ recommendJobsList: populatedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get job" });
  }
};

//search job
export const searchJob = catchAsync(async (req, res, next) => {
  try {
    const {
      text,
      category,
      lng,
      lat,
      distance,
      sortByRating,
      sortByPriceHighToLow,
      sortByPriceLowToHigh,
    } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    let query = {};

    if (text) {
      const regex = new RegExp(text, "i");
      query.$or = [
        { title: { $regex: regex } },
        { job_description: { $regex: regex } },
      ];
    }

    const existingCategory = await Job.findOne({ category });
    if (category && existingCategory) {
      query.category = category;
    }

    // Define the sort order
    let sort = {};
    if (sortByRating === "true") {
      sort.rating = -1;
    } else if (sortByPriceHighToLow === "true") {
      sort.price = -1;
    } else if (sortByPriceLowToHigh === "true") {
      sort.price = 1;
    } else {
      sort.createdAt = -1;
    }

    if (lng && lat && distance > 0) {
      const radius = parseFloat(distance) / 6378.1;
      query.address = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius],
        },
      };
    }

    // Execute the search query
    const jobs = await Job.find(query)
      .sort(sort)
      .populate("postedBy", "username email profilePic onlineStatus can_review")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      job: jobs,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Function to escape regular expression special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//update job status
export const updateJobStatus = catchAsync(async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { job_status, assignedTo } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.job_status = job_status;
    job.assignedTo = assignedTo;
    const userJobs = await job.save();

    res.status(200).json({ message: "Job status updated", userJobs });
  } catch (error) {
    next(error);
  }
});

//extract all jobs which is posted by me and status is completed
export const completedJobs = catchAsync(async (req, res, next) => {
  try {
    // Find jobs for the current page using skip and limit
    const job = await Job.find({
      postedBy: req.user._id,
      job_status: "Completed",
    })
      .sort({ createdAt: -1 })
      .populate("postedBy", "username email profilePic onlineStatus can_review")
      .populate(
        "assignedTo",
        "_id username email profilePic onlineStatus can_review"
      )
      .exec();

    // Get total number of jobs
    const totalJobs = await Job.countDocuments({
      postedBy: req.user._id,
      job_status: "Completed",
    });

    res.status(200).json({
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get job" });
  }
});
