import express from "express";
import { protect, permission } from "../domains/auth/middlewares/auth.js";
import {
  createConversation,
  createMessage,
  getConversation,
  getMessages,
} from "../domains/message/controller/index.js";
const router = express.Router();

// create conversation
router.route("/conversation").post(protect, createConversation);

// get all conversation
router.route("/getConversation").get(protect, getConversation);

// create message
router.route("/createMessage").post(protect, createMessage);

//get messages
router.route("/messagesCombo/:id").get(protect, getMessages);

export default router;
