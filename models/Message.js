import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Message = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    msg: {
      type: String,
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", Message);

export default MessageModel;
