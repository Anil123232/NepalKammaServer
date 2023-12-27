import express from "express";
const app = express();
import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
import connectMongo from "./config/connection.js";

//database connection
await connectMongo;

// routes for user
import user from "./src/routes/User.js";
app.use("/api/v1/user", user);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application.",
  });
});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
