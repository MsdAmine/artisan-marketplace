const express = require("express");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const hasCloudinaryConfig =
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_KEY &&
  process.env.CLOUDINARY_SECRET;

// Fallback to local disk storage when Cloudinary isn't configured so that
// product creation doesn't silently drop the image.
let storage;

if (hasCloudinaryConfig) {
  const StorageCtor = cloudinaryStorage.CloudinaryStorage || cloudinaryStorage;
  storage =
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
} else {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
}

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
    let imageUrl = req.file.path || req.file.secure_url || req.file.url;

    // When we are using the local disk fallback, `req.file.path` is an absolute
    // path on disk. Convert it to the public /uploads URL served by Express so
    // the frontend can render it.
    if (!hasCloudinaryConfig && req.file.filename) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res
        .status(500)
        .json({ error: "Upload succeeded but no URL returned" });
    }

    res.json({
      url: imageUrl, // Cloudinary or local URL
      public_id: req.file.filename, // Cloudinary public ID or local filename
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
