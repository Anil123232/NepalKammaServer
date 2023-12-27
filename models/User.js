import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["job_provider", "job_seeker", "admin"],
  },
  isVerified: {
    type: Boolean,
  },
});

const User = mongoose.model("User", UserInfoSchema);

export default User;
