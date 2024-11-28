const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const cloudinary = require('./utils/cloudinary');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware to allow requests from specific origin
app.use(cors({ credentials: true, origin: "*" }));

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Connect to Cloudinary
cloudinary.cloudinaryConnect();

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(error => console.log(error));