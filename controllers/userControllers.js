// Importing required modules and dependencies
const HttpError = require('../models/errorModel'); // Custom error model
const User = require('../models/userModel'); // User model for database interactions
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for generating and verifying JWT tokens
require('dotenv').config(); // Loads environment variables from a .env file
const cloudinary = require('cloudinary').v2; // Cloudinary library for managing cloud storage
const nodemailer = require('nodemailer'); // Library for sending emails

// Function to register a new user
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;

    // Validate required fields
    if (!name || !email || !password || !password2) {
      return next(new HttpError('Fill in all fields.', 422));
    }

    // Ensure email is unique and check for duplicates
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError('Email already exists.', 422));
    }

    // Validate password length and confirm passwords match
    if (password.trim().length < 6) {
      return next(new HttpError('Password should contain at least 6 characters.', 422));
    }
    if (password !== password2) {
      return next(new HttpError('Passwords do not match.', 422));
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = await User.create({ name, email: newEmail, password: hashedPass });

    res.status(201).json(`new user ${newEmail} registered`);
  } catch (error) {
    return next(new HttpError('User registration failed.', 422));
  }
};

// Function to log in an existing user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new HttpError('Fill in all fields.', 422));
    }

    // Retrieve user by email
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    // Validate user existence and email verification
    if (!user) {
      return next(new HttpError('Invalid credentials.', 422));
    }
    if (!user.verified) {
      return next(new HttpError('Please verify your email.', 422));
    }

    // Check if the password matches
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError('Invalid credentials.', 422));
    }

    // Generate JWT token for authentication
    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const expiresIn = 4 * 60 * 60; // Token expiry in seconds
    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    res.status(200).json({ token, id, name, expiryDate });
  } catch (error) {
    return next(new HttpError('User login failed.', 422));
  }
};

// Function to get details of a specific user
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch user details excluding the password
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }

    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError('Failed to fetch user details.', 500));
  }
};

// Function to change user avatar
const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(new HttpError('Please choose an image.', 422));
    }

    const user = await User.findById(req.user.id);

    // Delete the old avatar from Cloudinary, if it exists
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`sanidhya/${publicId}`);
    }

    // Validate new avatar size
    const { avatar } = req.files;
    if (avatar.size > 500000) {
      return next(new HttpError('Profile picture too big. Should be less than 500kb.', 422));
    }

    // Upload new avatar to Cloudinary
    const response = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: 'sanidhya',
      quality: '70',
    });

    // Update user's avatar URL in the database
    const updatedAvatar = await User.findByIdAndUpdate(req.user.id, { avatar: response.secure_url }, { new: true });

    res.status(200).json(updatedAvatar);
  } catch (error) {
    return next(new HttpError('Failed to change avatar.', 500));
  }
};

// Function to edit user information
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate required fields
    if (!name || !email || !currentPassword || !newPassword) {
      return next(new HttpError('Fill in all details.', 422));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError('User not found.', 403));
    }

    // Check for duplicate email
    const emailExist = await User.findOne({ email });
    if (emailExist && emailExist._id.toString() !== req.user.id) {
      return next(new HttpError('Email already exists.', 422));
    }

    // Validate current password
    const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validateUserPassword) {
      return next(new HttpError('Invalid current password.', 422));
    }

    // Ensure new passwords match
    if (newPassword !== confirmNewPassword) {
      return next(new HttpError('New passwords do not match.', 422));
    }

    // Hash the new password and update user information
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    const newInfo = await User.findByIdAndUpdate(req.user.id, { name, email, password: hash }, { new: true });

    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError('Failed to update user information.', 500));
  }
};

// Function to fetch all authors (users)
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select('-password');
    res.status(200).json(authors);
  } catch (error) {
    return next(new HttpError('Failed to fetch authors.', 500));
  }
};

// Verify email by sending a verification link
const verifyMail = async (req, res, next) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.toLowerCase(); // Normalize email to lowercase
    const user = await User.findOne({ email: newEmail });

    // Check if the user exists
    if (!user) {
        return next(new HttpError("User doesn't exist.", 422));
    }

    const { _id: id } = user;
    const ptoken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10m' }); // Generate token valid for 10 minutes

    try {
        // Configure email transport
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Send verification email
        await transporter.sendMail({
            from: `${process.env.MAIL_USER}`,
            to: `${email}`,
            subject: `Verify Mail`,
            html: `<h1>Verify your mail</h1>
            <p>Click on the following link to verify your mail:</p>
            <a href="http://localhost:3000/verified/${ptoken}">http://localhost:3000/verified/${ptoken}</a>
            <p>The link will expire in 10 minutes.</p>`,
        });

        res.status(200).json("Mail sent");
    } catch (error) {
        return next(new HttpError("Link Cannot be sent.", 500));
    }
};

// Verify the email using the token
const verifiedMail = async (req, res, next) => {
    try {
        const ptoken = req.params.token;

        // Verify the token
        const decodedToken = jwt.verify(ptoken, process.env.JWT_SECRET);

        if (!decodedToken) {
            return next(new HttpError('Unauthorized. Invalid token', 403));
        }

        const id = decodedToken.id;

        // Update user's verification status
        const newInfo = await User.findByIdAndUpdate(id, { verified: 1 }, { new: true });
        res.status(200).json(newInfo);
    } catch (error) {
        return next(new HttpError("Cannot verify the Mail.", 500));
    }
};

// Handle forgot password functionality by sending a reset link
const ForgotPassword = async (req, res, next) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.toLowerCase(); // Normalize email to lowercase
    const user = await User.findOne({ email: newEmail });

    // Check if the user exists
    if (!user) {
        return next(new HttpError("User doesn't exist.", 422));
    }

    const { _id: id } = user;
    const ptoken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10m' }); // Generate token valid for 10 minutes

    try {
        // Configure email transport
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Send reset password email
        await transporter.sendMail({
            from: `${process.env.MAIL_USER}`,
            to: `${email}`,
            subject: `Reset Password`,
            html: `<h1>Reset Your Password</h1>
            <p>Click on the following link to reset your password:</p>
            <a href="http://localhost:3000/reset-password/${ptoken}">http://localhost:3000/reset-password/${ptoken}</a>
            <p>The link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>`,
        });

        res.status(200).json("Mail sent");
    } catch (error) {
        return next(new HttpError("Link Cannot be sent.", 500));
    }
};

// Reset the user's password using the token
const ResetPassword = async (req, res, next) => {
    try {
        const ptoken = req.params.token;
        const { password, password2 } = req.body;

        // Verify the token
        const decodedToken = jwt.verify(ptoken, process.env.JWT_SECRET);

        if (!decodedToken) {
            return next(new HttpError('Unauthorized. Invalid token', 403));
        }

        // Validate password fields
        if (!password || !password2) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        if ((password.trim()).length < 6) {
            return next(new HttpError("Password should contain at least 6 characters.", 422));
        }

        if (password !== password2) {
            return next(new HttpError("Passwords do not match.", 422));
        }

        const id = decodedToken.id;

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Update user's password
        const newInfo = await User.findByIdAndUpdate(id, { password: hashedPass }, { new: true });
        res.status(200).json(newInfo);
    } catch (error) {
        return next(new HttpError("User Password can't be updated.", 500));
    }
};

// Export all functions
module.exports = {
    registerUser,     // Register a new user
    loginUser,        // Login user
    getUser,          // Retrieve user details
    editUser,         // Edit user profile
    getAuthors,       // Get all authors
    changeAvatar,     // Update user avatar
    ResetPassword,    // Reset password
    ForgotPassword,   // Handle forgot password
    verifyMail,       // Send verification email
    verifiedMail,     // Verify email using token
};
