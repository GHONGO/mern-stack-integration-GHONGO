// Category.js - Mongoose model for categories

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  // Only generate slug if it doesn't exist or name was modified
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

// Add a method to handle bulk inserts
CategorySchema.statics.createWithSlug = async function(categoryData) {
  const slug = categoryData.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  
  return this.create({
    ...categoryData,
    slug
  });
};

module.exports = mongoose.model('Category', CategorySchema);