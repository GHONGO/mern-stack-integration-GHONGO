const Post = require('../models/Post');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

const postController = {
  getAllPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category;
      const skip = (page - 1) * limit;

      let query = { isPublished: true };
      if (category) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }

      const posts = await Post.find(query)
        .populate('author', 'username')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments(query);

      res.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  getPost: async (req, res) => {
    try {
      let post;
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        post = await Post.findById(req.params.id)
          .populate('author', 'username')
          .populate('category', 'name slug')
          .populate('comments.user', 'username');
      } else {
        post = await Post.findOne({ slug: req.params.id })
          .populate('author', 'username')
          .populate('category', 'name slug')
          .populate('comments.user', 'username');
      }

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      await post.incrementViewCount();

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  createPost: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const postData = {
        ...req.body,
        author: req.user._id,
      };

      if (req.file) {
        postData.featuredImage = req.file.filename;
      }

      const post = await Post.create(postData);

      const newPost = await Post.findById(post._id)
        .populate('author', 'username')
        .populate('category', 'name slug');

      res.status(201).json({
        success: true,
        data: newPost,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Post with this title already exists',
        });
      }
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  updatePost: async (req, res) => {
    try {
      let post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this post',
        });
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.featuredImage = req.file.filename;
      }

      post = await Post.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      }).populate('author', 'username').populate('category', 'name slug');

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this post',
        });
      }

      await Post.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  addComment: async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Comment content is required',
        });
      }

      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      await post.addComment(req.user._id, content);
      
      const updatedPost = await Post.findById(req.params.id)
        .populate('author', 'username')
        .populate('category', 'name slug')
        .populate('comments.user', 'username');

      res.json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  searchPosts: async (req, res) => {
    try {
      const query = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const searchRegex = new RegExp(query, 'i');
      
      const posts = await Post.find({
        isPublished: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex },
          { tags: searchRegex },
        ],
      })
        .populate('author', 'username')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        isPublished: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex },
          { tags: searchRegex },
        ],
      });

      res.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },
};

module.exports = postController;