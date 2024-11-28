// Import necessary modules
const { Router } = require('express'); // Import Router class from express
const {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
} = require('../controllers/postControllers'); // Import post controller functions
const authMiddleware = require('../middleware/authMiddleware'); // Import authentication middleware

// Create a router object
const router = Router();

// Define post routes:

  // POST /: Creates a new post (requires authentication, handled by createPost function)
  router.post('/', authMiddleware, createPost);

  // GET /: Gets all posts (handled by getPosts function)
  router.get('/', getPosts);

  // GET /:id: Gets a specific post by ID (handled by getPost function)
  router.get('/:id', getPost);

  // GET /categories/:category: Gets posts by category (handled by getCatPosts function)
  router.get('/categories/:category', getCatPosts);

  // GET /users/:id: Gets all posts of a specific user (handled by getUserPosts function)
  router.get('/users/:id', getUserPosts);

  // PATCH /:id: Edits a post (requires authentication, handled by editPost function)
  router.patch('/:id', authMiddleware, editPost);

  // DELETE /:id: Deletes a post (requires authentication, handled by deletePost function)
  router.delete('/:id', authMiddleware, deletePost);

// Export the router object for use in other parts of the application
module.exports = router;