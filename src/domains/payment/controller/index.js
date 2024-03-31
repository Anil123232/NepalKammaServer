import Payment from "../../../../models/Payment.js";
import catchAsync from "../../../utils/catchAsync.js";

//create payment
export const createPayment = catchAsync(async (req, res, next) => {
  try {
    const { PaymentBy, PaymentTo, job, amount } = req.body;
    console.log("hitted payment controller");
    const payment = await Payment.create({
      PaymentBy,
      PaymentTo,
      job,
      amount,
    });
    console.log("payment", payment);
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

export const getPaymentByProvider = catchAsync(async (req, res, next) => {
  try {
    const payments = await Payment.find({
      PaymentTo: req.user._id,
      paymentStatus: { $in: ["provider_paid", "request_payment"] },
    })
      .populate("PaymentBy", "username email")
      .populate("PaymentTo", "username email")
      .populate({
        path: "job",
        populate: {
          path: "postedBy",
          select: "username email profilePic",
        },
      });

    res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get payments" });
  }
});

//request payment update payment_status to request_payment
export const requestPayment = catchAsync(async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, {
      paymentStatus: "request_payment",
    });
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request payment" });
  }
});
