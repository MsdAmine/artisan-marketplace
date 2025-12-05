const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true // Force HTTPS URLs (recommended)
});

if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
  console.warn("⚠️  Cloudinary environment variables are missing!");
}

module.exports = cloudinary;
