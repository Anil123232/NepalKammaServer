import Gig from "../../../../models/Gig.js";
import { getDataUris } from "../../../utils/Features.js";
import catchAsync from "../../../utils/catchAsync.js";
import cloudinary from "cloudinary";

// upload images
export const uploadImages = catchAsync(async (req, res, next) => {
  try {
    console.log(req.files)
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

    const imagesData = new Gig({
      images: images,
    });

    await imagesData.save();

    res.status(201).json({ message: "Successfully! uploaded", imagesData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload images" });
  }
});

//create gig or update gig with data
export const createGig = catchAsync(async (req, res, next) => {
  try {
    const gig_id = req.params.id;
    const gig = await Gig.findById(gig_id);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    const { title, gig_description, price, category } = req.body;
    // just upadte with this data and i get the id from params
    const gigData = await Gig.findByIdAndUpdate(
      gig_id,
      {
        title,
        gig_description,
        price,
        category,
        postedBy: req.user._id,
      },
      { new: true }
    );

    res.status(201).json({ message: "Successfully! created", gigData });
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
