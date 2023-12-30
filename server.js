import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(jsonParser);
import connectMongo from "./config/connection.js";

//database connection
await connectMongo;

// routes for user
import user from "./src/routes/User.js";
app.use("/api/v1/user", user);

// routes for auth
import auth from "./src/routes/Auth.js"
app.use("/api/v1/auth", auth);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application.",
  });
});

app.listen(8000, () => console.log("Example app is listening on port 8000."));
