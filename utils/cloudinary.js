// Configures Cloudinary for image and video uploads
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const cloudinaryConnect = () => { 
  try {
    // Sets up Cloudinary configuration using environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  } catch (error) {
    // Handles errors that may occur during configuration
    return next(new HttpError(error));
  }
};

module.exports = { cloudinaryConnect };