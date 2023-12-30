import User from "../../../models/User.js";
import catchAsync from "../../utils/catchAsync.js";
import createError from "../../utils/createError.js";

export const checkAuthentication = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user).select("-password");
  if (!user) throw createError(401, "User not found");
  res.status(200).json({
    status: "success",
    user,
  });
});
