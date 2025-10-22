const Category = require('../models/Category');
const { validationResult } = require('express-validator');

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find().sort({ name: 1 });
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },

  createCategory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists',
        });
      }
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message,
      });
    }
  },
};

module.exports = categoryController;