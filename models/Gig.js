import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GigInfoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    gig_description: {
      type: String,
      required: true,
    },
    images: [
      {
        public_id: {
          type: String,
          default: "",
        },
        url: {
          type: String,
          default: "",
        },
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

const Gig = mongoose.model("Gig", GigInfoSchema);

export default Gig;
