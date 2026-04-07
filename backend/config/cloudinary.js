const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️  Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET ✅' : 'MISSING ❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET ✅' : 'MISSING ❌',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stag-io/cvs",
    allowed_formats: ["pdf", "docx"],
    resource_type: "raw",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { cloudinary, upload };