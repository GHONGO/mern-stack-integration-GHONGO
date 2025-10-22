const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

const categoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name cannot be more than 50 characters'),
];

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, admin, categoryValidation, categoryController.createCategory);

module.exports = router;