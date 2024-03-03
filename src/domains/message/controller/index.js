import catchAsync from "../../../utils/catchAsync.js";
import ConversationModel from "../../../../models/Conversation.js";
import MessageModel from "../../../../models/Message.js";

export const createConversation = catchAsync(async (req, res, next) => {
  try {
    console.log(req.body);
    const senderId = req.body.senderId;
    const receiverId = req.body.receiverId;

    const existingConversation = await ConversationModel.findOne({
      conversation: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json({ conversation: existingConversation });
    }
    const conversation = new ConversationModel({
      conversation: [senderId, receiverId],
    });
    await conversation.save();
    res.status(200).json({ conversation });
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

export const getConversation = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await ConversationModel.find({
      conversation: { $in: [userId] },
    })
      .populate({
        path: "conversation",
        model: "User",
        options: { strictPopulate: false },
        select: "-password -savedPost -isVerified -bio",
      })
      .exec();

    const filteredResult = result.filter((message) => {
      if (message.conversation.some((conv) => conv._id.equals(userId))) {
        message.conversation = message.conversation
          .map((conv) => (conv._id.equals(userId) ? null : conv))
          .filter((conv) => conv !== null);
      }
      return message;
    });

    res.status(200).json({ result: filteredResult });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failted to get Conversation" });
  }
});

// for message
export const createMessage = catchAsync(async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const conversationId = req.body.conversationId;
    const msg = req.body.msg;
    const messages = new MessageModel({
      senderId,
      conversationId,
      msg,
    });
    await messages.save();
    res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create new message" });
  }
});

//get message of conversation of user
export const getMessages = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await MessageModel.find({ conversationId: id });
    const conversation = await ConversationModel.findById(id)
      .populate({
        path: "conversation",
        model: "User",
        options: { strictPopulate: false },
        select: "profilePic username _id",
      })
      .exec();

    const otherUser = conversation.conversation.filter(
      (user) => user._id.toString() !== req.user._id.toString()
    )[0];

    res.status(200).json({ result, otheruser: otherUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});
