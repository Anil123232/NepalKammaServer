import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import cloudinary from "cloudinary";
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

// //setting up the multer diskstorage
// const storage = new multer.diskStorage({
//   destination: "./public/uploads",
//   filename: function (req, file, callback) {
//     callback(
//       null,
//       file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname)
//     );
//   },
// });

// //init the uploads
// const upload = multer({
//   storage: storage,
// });

// // Define the route for uploading files
// app.post("/upload", upload.single("image"), (req, res) => {
//   console.log("hitted")
//   console.log(req)
//   // Handle the uploaded file here
//   const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
//   res.json({ imageUrl });
// });

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application.",
  });
});

app.listen(8000, () => console.log("App is listening on port 8000."));
