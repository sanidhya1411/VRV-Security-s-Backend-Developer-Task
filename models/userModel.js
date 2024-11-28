// Import necessary modules
const { Schema, model } = require('mongoose');

// Define the user schema
const userSchema = new Schema({
  // User's name (required)
  name: { type: String, required: true },

  // User's email (required, unique)
  email: { type: String, required: true, unique: true },

  // User's password (required)
  password: { type: String, required: true },

  // User's avatar image URL
  avatar: { type: String },

  // Verification status (0: not verified, 1: verified)
  verified: { type: Number, default: 0 },

  // Number of posts created by the user
  posts: { type: Number, default: 0 }
});

// Create and export the User model
module.exports = model('User', userSchema);