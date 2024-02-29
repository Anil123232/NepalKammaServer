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
  title: {
    type: String,
    default: "",
  },
  about_me: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  isTick: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    required: true,
  },
  skills: [
    {
      type: String,
      default: "",
    },
  ],
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
