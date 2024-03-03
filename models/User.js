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
      default: "https://asset.cloudinary.com/dcnm2ql9y/9cfe2e5781a9c7827b051a34670450e0",
    },
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dcnm2ql9y/image/upload/v1709398361/vectorstock_42797457_rzmscx.png",
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
