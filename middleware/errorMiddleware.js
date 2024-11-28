// Error handling middleware

// Handles 404 Not Found errors
const notFound = (req, res, next) => {
    // Create a new Error object with a specific message
    const error = new Error(`Not Found - ${req.originalUrl}`);
  
    // Set the HTTP status code to 404
    res.status(404);
  
    // Pass the error to 1  the next error handling middleware
    next(error);
  };
  
  // Handles general errors
  const errorHandler = (error, req, res, next) => {
    // If the response header has already been sent, pass the error to the next middleware
    if (res.headersSent) {
      return next(error);
    }
  
    // Set the appropriate HTTP status code based on the error code
    res.status(error.code || 500);
  
    // Send a JSON response with an error message
    res.json({ message: error.message || 'An unknown error occurred' });
  };
  
  // Export both middleware functions
  module.exports = { notFound, errorHandler };