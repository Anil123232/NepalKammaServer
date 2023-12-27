import catchAsync from "../../../utils/catchAsync.js";
import User from "../../../../models/User.js";
import bcrypt from "bcrypt";
import { sendOTPVerificationEmail } from "../Otp/sendVerficationEmail.js";
import UserOTPVerification from "../../../../models/UserOTPVerification.js";
import { hashPassword } from "../../../utils/hashBcrypt.js";
import jwt from "jsonwebtoken";

//create user --> signup
export const createUser = catchAsync(async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const findEmail = await User.findOne({ email });
    const findUsername = await User.findOne({ username });
    if (findEmail && findEmail.isVerified === true) {
      return res.status(422).json({ message: "Email already exists" });
    }
    if (findEmail && findEmail.isVerified === false) {
      return res.status(422).json({
        message:
          "Your email is not verified, check your gmail and verify it, to login",
      });
    }
    if (findUsername) {
      return res.status(422).json({ message: "Username already exists" });
    }
    const hashedPassword = await hashPassword(password);

    const signupUser = new User({
      email,
      password: hashedPassword,
      username,
      role,
      isVerified: false,
    });
    await signupUser
      .save()
      .then((result) => {
        // handle account verification
        sendOTPVerificationEmail(result, res);
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    throw new Error(err);
  }
});

// verify OTP
export const verifyUser = catchAsync(async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.json({
        status: "failed",
        message: "All fields are required",
      });
    }

    // Retrieve user otp records
    const userOtpRecords = await UserOTPVerification.find({ userId });
    if (userOtpRecords.length <= 0) {
      return res.json({
        status: "failed",
        message: "Invalid OTP",
      });
    }
    const { expiresAt, otp: hashedOTP } = userOtpRecords[0];
    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({ userId });
      return res.json({
        status: "failed",
        message: "OTP expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, hashedOTP);

    if (!isMatch) {
      return res.json({
        status: "failed",
        message: "Invalid OTP",
      });
    }

    // Update user verification status and delete OTP records
    await User.findByIdAndUpdate(userId, { isVerified: true });
    await UserOTPVerification.deleteMany({ userId });

    return res.json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// resend OTP
export const resendOTP = catchAsync(async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.json({
        status: "failed",
        message: "All fields are required",
      });
    } else {
      // delete existing records and resend
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);

      // const user = await User.findOne({ _id: userId, email });
      // if (!user) {
      //   return res.json({
      //     status: "failed",
      //     message: "User not found",
      //   });
      // } else {
      //   sendOTPVerificationEmail(user, res);
      // }
    }
  } catch (err) {
    res.json({
      status: "failed",
      message: "Something went wrong",
    });
  }
});

// login user --> login
export const LoginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const findEmail = await User.findOne({ email });
  if (!findEmail || findEmail == null) {
    res.status(422).json({ message: "Email not found" });
  } else {
    if (findEmail.isVerified === true) {
      const decryptPass = await bcrypt.compare(password, findEmail.password);
      if (decryptPass) {
        jwt.sign(
          { userId: findEmail._id },
          process.env.SECRET_KEY,
          { expiresIn: 86400 },
          (err, token) => {
            if (err) {
              return res.status(404).json({ message: "You must login first" });
            }
            res.status(200).json({ message: "Successfully, logged in", token });
          }
        );
      } else {
        res.status(422).json({ message: "Email or Password doesn't match" });
      }
    } else {
      res.status(422).json({ message: "Your email is not verified!" });
    }
  }
});
