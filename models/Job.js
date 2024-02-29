import mongoose from "mongoose";
const Schema = mongoose.Schema;

const JobInfoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    address: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    skills_required: [
      {
        type: String,
        required: true,
      },
    ],
    job_description: {
      type: String,
      required: true,
    },
    payment_method: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create the geospatial index
JobInfoSchema.index({ "address.coordinates": "2dsphere" });


const Job = mongoose.model("Job", JobInfoSchema);

export default Job;
