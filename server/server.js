// server.js - Main server file for the MERN blog application

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Import models
const Category = require('./models/Category');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('MERN Blog API is running');
});

// Function to create sample categories
const createSampleCategories = async () => {
  try {
    const categoriesCount = await Category.countDocuments();
    
    if (categoriesCount === 0) {
      const sampleCategories = [
        { name: 'Technology', description: 'Posts about technology and programming' },
        { name: 'Web Development', description: 'Frontend and backend development' },
        { name: 'JavaScript', description: 'Everything about JavaScript' },
        { name: 'React', description: 'React.js and related technologies' },
        { name: 'Node.js', description: 'Server-side JavaScript' },
        { name: 'MongoDB', description: 'Database and data management' },
        { name: 'Tutorials', description: 'Step-by-step guides' },
        { name: 'Career', description: 'Career advice and programming jobs' }
      ];

      // Create categories one by one to trigger the slug pre-save hook
      for (const categoryData of sampleCategories) {
        const category = new Category(categoryData);
        await category.save();
      }
      
      console.log('Sample categories created successfully');
    } else {
      console.log(`Found ${categoriesCount} existing categories`);
    }
  } catch (error) {
    console.error('Error creating sample categories:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Create sample categories after connection
    createSampleCategories();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;