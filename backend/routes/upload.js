const express = require("express");
const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "artisan_market", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // FIXED KEY
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  try {
    res.json({
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public ID
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
