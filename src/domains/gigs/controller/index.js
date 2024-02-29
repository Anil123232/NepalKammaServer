import Gig from "../../../../models/Gig.js";
import { getDataUris } from "../../../utils/Features.js";
import catchAsync from "../../../utils/catchAsync.js";
import cloudinary from "cloudinary";

// upload images
export const uploadImages = catchAsync(async (req, res, next) => {
  try {
    const files = getDataUris(req.files);

    const images = [];
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      const cdb = await cloudinary.v2.uploader.upload(fileData, {});
      images.push({
        public_id: cdb.public_id,
        url: cdb.secure_url,
      });
    }
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload images" });
  }
});

//create gig
export const createGig = catchAsync(async (req, res, next) => {
  try {
    const { title, gig_description, price, category } = req.body;

    console.log("hitted");
    // Now you have an array of image URIs in imageURIs
    console.log(req.body);

    // Convert files to data URIs
    // const files = getDataUris(imagesData);
    // console.log(files)

    // Convert data URIs to cloudinary URLs
    // const images = [];
    // for (let i = 0; i < files.length; i++) {
    //   const fileData = files[i];
    //   const cdb = await cloudinary.v2.uploader.upload(fileData, {});
    //   images.push({
    //     public_id: cdb.public_id,
    //     url: cdb.secure_url,
    //   });
    // }

    // Create new gig data
    // const gigData = new Gig({
    //   title,
    //   gig_description,
    //   images,
    //   price,
    //   category,
    //   postedBy: req.user._id,
    // });

    // Save gig data to the database
    // await gigData.save();

    // Respond with success message
    // res.status(201).json({ message: "Successfully! created" });
  } catch (err) {
    console.error(err);
    // Respond with error message
    res.status(500).json({ message: "Failed to create gig" });
  }
});

// get Gig
export const getGig = catchAsync(async (req, res, next) => {
  try {
    const gig = await Gig.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username email")
      .exec();
    res.status(200).json({ gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get gig" });
  }
});
