// Defines a custom HttpError class that extends the Error class
class HttpError extends Error {
    constructor(message, errorCode) {
      // Call the parent class constructor to initialize the message
      super(message);
  
      // Set the custom error code property
      this.code = errorCode;
    }
  }
  
  // Export the HttpError class for use in other parts of the application
  module.exports = HttpError;