// Import necessary modules
const { Schema, model } = require('mongoose');

// Define the post schema
const postSchema = new Schema({
  // Post title (required)
  title: { type: String, required: true },

  // Post category (required, limited to specific options)
  category: {
    type: String,
    enum: [
      "Agriculture",
      "Business",
      "Education",
      "Entertainment",
      "Food",
      "Sports",
      "Weather",
      "Uncategorized"
    ],
    message: '{VALUE} is not a supported category'
  },

  // Post description (required)
  description: { type: String, required: true },

  // Post thumbnail image URL (required)
  thumbnail: { type: String, required: true },

  // Reference to the user who created the post
  creator: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }); // Add timestamps for creation and update times

// Create and export the Post model
module.exports = model("Post", postSchema);