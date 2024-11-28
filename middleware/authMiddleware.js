// Import necessary modules
const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');
require('dotenv').config();

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  // Check if the Authorization header is present and starts with 'Bearer'
  const Authorization = req.headers.Authorization || req.headers.authorization;

  if (Authorization && Authorization.startsWith('Bearer')) {
    // Extract the token from the Authorization header
    const token = Authorization.split(' ')[1];

    // Verify the token using the JWT secret
    jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
      if (err) {
        // Handle token verification errors
        return next(new HttpError('Unauthorized. Invalid token', 403));
      }

      // Attach the decoded user information to the request object
      req.user = info;

      // Proceed to the next middleware or route handler
      next();
    });
  } else {
    // Handle cases where the Authorization header is missing or invalid
    return next(new HttpError('Unauthorized. No token', 402));
  }
};

// Export the authentication middleware
module.exports = authMiddleware;