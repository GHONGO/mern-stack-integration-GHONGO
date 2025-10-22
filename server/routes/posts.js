const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const postValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Valid category ID is required'),
];

router
  .route('/')
  .get(postController.getAllPosts)
  .post(protect, upload.single('featuredImage'), postValidation, postController.createPost);

router
  .route('/search')
  .get(postController.searchPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .put(protect, upload.single('featuredImage'), postValidation, postController.updatePost)
  .delete(protect, postController.deletePost);

router
  .route('/:id/comments')
  .post(protect, postController.addComment);

module.exports = router;