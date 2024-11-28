// Import necessary modules
const { Router } = require('express'); // Import Router class from express
const {
  registerUser,
  loginUser,
  getUser,
  editUser,
  getAuthors,
  changeAvatar,
  ResetPassword,
  ForgotPassword,
  verifyMail,
  verifiedMail,
} = require('../controllers/userControllers'); // Import user controller functions
const authMiddleware = require('../middleware/authMiddleware'); // Import authentication middleware

// Create a router object
const router = Router();

// Define user routes:

  // POST /register: Registers a new user (handled by registerUser function)
  router.post('/register', registerUser);

  // POST /login: Logs in a user (handled by loginUser function)
  router.post('/login', loginUser);

  // GET /:id: Gets a user by ID (handled by getUser function)
  router.get('/:id', getUser);

  // GET /: Gets all users (handled by getAuthors function) - Consider adding authorization for this route
  router.get('/', getAuthors);

  // POST /change-avatar: Uploads a new avatar for a user (requires authentication, handled by changeAvatar function)
  router.post('/change-avatar', authMiddleware, changeAvatar);

  // PATCH /edit-user: Edits a user's profile (requires authentication, handled by editUser function)
  router.patch('/edit-user', authMiddleware, editUser);

  // POST /forgotPassword: Initiates password reset process (handled by ForgotPassword function)
  router.post('/forgotPassword', ForgotPassword);

  // PATCH /resetPassword/:token: Resets a password using a token (handled by ResetPassword function)
  router.patch('/resetPassword/:token', ResetPassword);

  // POST /verify: Sends a verification email (handled by verifyMail function)
  router.post('/verify', verifyMail);

  // PATCH /verified/:token: Verifies a user's email using a token (handled by verifiedMail function)
  router.patch('/verified/:token', verifiedMail);

// Export the router object for use in other parts of the application
module.exports = router;