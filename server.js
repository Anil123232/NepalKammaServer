import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import cloudinary from "cloudinary";
import requestp from "request-promise";
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(jsonParser);
import connectMongo from "./config/connection.js";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

//database connection
await connectMongo;

//cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// routes for user
import user from "./src/routes/User.js";
app.use("/api/v1/user", user);

// routes for auth
import auth from "./src/routes/Auth.js";
app.use("/api/v1/auth", auth);

// routes for job
import job from "./src/routes/Job.js";
app.use("/api/v1/job", job);

// routes for gigs
import Gig from "./src/routes/Gig.js";
app.use("/api/v1/gig", Gig);

// routes for message
import Message from "./src/routes/Message.js";
app.use("/api/v1/message", Message);

//routes for admin
import Admin from "./src/routes/Admin.js";
app.use("/api/v1/admin", Admin);

//routes for payment
import Payment from "./src/routes/Payment.js";
app.use("/api/v1/payment", Payment);

// socket IO implementation
import { createServer } from "http";
import { Server } from "socket.io";
import MessageModel from "./models/Message.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  // cors: {
  //   origin: "http://localhost:8081",
  //   methods: ["GET", "POST"],
  // },
});

const onlineUsers = [];

const addNewUser = (userId, socketId) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
    io.emit("getU", onlineUsers); // Emit updated onlineUsers array
  }
};

const removeUser = (socketId) => {
  const index = onlineUsers.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    onlineUsers.splice(index, 1);
    io.emit("getU", onlineUsers); // Emit updated onlineUsers array
  }
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// Socket Connection
io.on("connection", (socket) => {
  console.log(socket.id, "connected.");

  socket.on("addUser", (data) => {
    console.log(data.username, "is online.");
    addNewUser(data.userId, socket.id);
    console.log(onlineUsers);
  });

  socket.on("getOnlineUsers", (data) => {
    io.emit("getU", onlineUsers);
  });

  socket.on("conversationOpened", ({ conversationId, senderId }) => {
    console.log(conversationId, senderId, "conversation opened.");
    MessageModel.updateMany(
      { conversationId: conversationId, senderId: { $ne: senderId } },
      { isRead: true }
    );
  });

  // for messages
  socket.on("textMessage", ({ sender, receiver, message, conversationId }) => {
    console.log(sender, receiver, message, "message received.");
    const socketIdReceiver = getUser(receiver);
    if (socketIdReceiver) {
      io.to(socketIdReceiver.socketId).emit("textMessageFromBack", {
        sender,
        receiver,
        message,
        conversationId,
      });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

//khalti payment gateway
app.post("/charge", function (req, res) {
  // console.log(payload);

  var KHALTI_VERIFY = "https://khalti.com/api/v2/payment/verify/";
  let options = {
    method: "POST",
    uri: KHALTI_VERIFY,
    body: JSON.stringify({
      token: req.body.token,
      amount: req.body.amount,
    }),
    headers: {
      Authorization: `Key test_secret_key_145d56666e594324b894aef5e899160f`,
      "Content-Type": "application/json",
    },
  };
  requestp(options)
    .then((result) => {
      console.log("charged", result);
      res.jsonp({
        data: result,
        status: "success",
      });
    })
    .catch((error) => {
      res.status(500).send({
        error: error.response.data,
        status: "failed",
      });
    });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application.",
  });
});

httpServer.listen(8000, () => console.log("App is listening on port 8000."));
