import mongoose from "mongoose";

const UserOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const UserOTPVerification = mongoose.model(
  "UserOtpVerification",
  UserOTPVerificationSchema
);

export default UserOTPVerification;
