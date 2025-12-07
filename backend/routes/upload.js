const express = require("express");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const StorageCtor = cloudinaryStorage.CloudinaryStorage || cloudinaryStorage;
const storage =
  typeof StorageCtor === "function" && StorageCtor.prototype
    ? new StorageCtor({
        cloudinary,
        params: {
          folder: "artisan_market", // Folder name in Cloudinary
          allowed_formats: ["jpg", "png", "jpeg", "webp"], // FIXED KEY
        },
      })
    : cloudinaryStorage({
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
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Some versions of multer-storage-cloudinary expose the URL as `path`, while
    // others expose it as `secure_url`/`url`. Ensure we always return a usable
    // value so the frontend can persist the product image.
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;

    if (!imageUrl) {
      return res.status(500).json({ error: "Upload succeeded but no URL returned" });
    }

    res.json({
      url: imageUrl, // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public ID
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
