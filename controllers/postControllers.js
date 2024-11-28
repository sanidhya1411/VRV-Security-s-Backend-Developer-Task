// Import required modules and models
const Post = require('../models/postModel');
const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const cloudinary = require('cloudinary').v2;

// Create a new post
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;

        // Check if required fields and thumbnail are provided
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose a thumbnail."));
        }

        const { thumbnail } = req.files;

        // Validate thumbnail size
        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File should be less than 2MB."));
        }

        // Upload thumbnail to Cloudinary
        const response = await cloudinary.uploader.upload(
            thumbnail.tempFilePath,
            { folder: 'sanidhya', quality: "70" },
            async (err) => {
                if (err) {
                    return next(new HttpError(err));
                }
            }
        );

        if (response) {
            // Create new post
            const newPost = await Post.create({
                title,
                category,
                description,
                thumbnail: response.secure_url,
                creator: req.user.id,
            });

            if (!newPost) {
                return next(new HttpError("Post couldn't be created.", 422));
            }

            // Update user's post count
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser.posts + 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

            res.status(201).json(newPost);
        } else {
            return next(new HttpError("Post couldn't be created.", 422));
        }
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Fetch all posts sorted by updated time
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Fetch a single post by ID
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Fetch posts by category
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Fetch posts created by a specific user
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Edit a post by ID
const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let updatedPost;
        let { title, category, description } = req.body;

        // Validate input fields
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        const oldPost = await Post.findById(postId);

        // Check if the logged-in user is the creator of the post
        if (req.user.id == oldPost.creator) {
            if (!req.files) {
                // Update post without changing the thumbnail
                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
            } else {
                // Delete old thumbnail from Cloudinary
                const publicId = oldPost.thumbnail.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`sanidhya/${publicId}`);

                // Upload new thumbnail
                const { thumbnail } = req.files;
                if (thumbnail.size > 3000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 3MB."));
                }

                const response = await cloudinary.uploader.upload(
                    thumbnail.tempFilePath,
                    { folder: 'sanidhya', quality: "70" },
                    async (err) => {
                        if (err) {
                            return next(new HttpError(err));
                        }
                    }
                );

                updatedPost = await Post.findByIdAndUpdate(
                    postId,
                    { title, category, description, thumbnail: response.secure_url },
                    { new: true }
                );
            }

            if (!updatedPost) {
                return next(new HttpError("Couldn't update post.", 400));
            }

            res.status(200).json(updatedPost);
        } else {
            return next(new HttpError("Couldn't update post.", 403));
        }
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Delete a post by ID
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            return next(new HttpError("Post unavailable", 400));
        }

        const post = await Post.findById(postId);

        // Check if the logged-in user is the creator of the post
        if (req.user.id == post.creator) {
            // Delete thumbnail from Cloudinary
            const publicId = post.thumbnail.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`sanidhya/${publicId}`);

            // Delete the post
            await Post.findByIdAndDelete(postId);

            // Update user's post count
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

            res.json(`Post ${postId} deleted`);
        } else {
            return next(new HttpError("Post couldn't be deleted", 403));
        }
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Export all post-related functions
module.exports = {
    createPost,   // Create a new post
    getPosts,     // Fetch all posts
    getPost,      // Fetch a single post
    getCatPosts,  // Fetch posts by category
    getUserPosts, // Fetch posts by user
    editPost,     // Edit a post
    deletePost,   // Delete a post
};
