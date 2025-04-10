const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// In-memory storage for categories (in a real app, this would be a database)
let categories = [];
let customCategories = [];

/**
 * Get all categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllCategories = (req, res, next) => {
  try {
    // Combine AI-generated and custom categories
    const allCategories = [...categories, ...customCategories];
    res.status(200).json(allCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh categories using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshCategories = async (req, res, next) => {
  try {
    // Get bookmarks from the bookmark controller
    const bookmarkController = require('./bookmarkController');
    const bookmarks = bookmarkController.getAllBookmarks({}, { json: (data) => data }, {});
    
    // Generate categories based on bookmarks
    categories = await geminiService.generateCategories(bookmarks);
    
    // Combine with custom categories
    const allCategories = [...categories, ...customCategories];
    
    res.status(200).json(allCategories);
  } catch (error) {
    logger.error(`Error refreshing categories: ${error.message}`);
    next(error);
  }
};

/**
 * Get custom categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCustomCategories = (req, res, next) => {
  try {
    res.status(200).json(customCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a custom category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addCustomCategory = (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name is required' 
      });
    }
    
    // Check if category already exists
    if (customCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category already exists' 
      });
    }
    
    // Add custom category
    const newCategory = {
      id: Date.now().toString(),
      name,
      description: `Custom category: ${name}`,
      isCustom: true
    };
    
    customCategories.push(newCategory);
    
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a custom category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteCustomCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the category
    const categoryIndex = customCategories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    
    // Remove the category
    customCategories.splice(categoryIndex, 1);
    
    res.status(200).json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Initialize with default categories
(async () => {
  try {
    categories = [
      { name: 'Technology', description: 'Tech news, gadgets, software, and digital trends' },
      { name: 'News', description: 'Current events, world news, and headlines' },
      { name: 'Education', description: 'Learning resources, courses, and educational content' },
      { name: 'Entertainment', description: 'Movies, TV shows, music, and other entertainment' },
      { name: 'Finance', description: 'Personal finance, investing, and financial news' },
      { name: 'Health', description: 'Health tips, medical information, and wellness' },
      { name: 'Travel', description: 'Travel destinations, guides, and tips' },
      { name: 'Shopping', description: 'Online stores, products, and shopping guides' },
      { name: 'Social Media', description: 'Social networking sites and content' },
      { name: 'Uncategorized', description: 'Bookmarks that don\'t fit other categories' }
    ];
  } catch (error) {
    logger.error(`Error initializing categories: ${error.message}`);
  }
})();

module.exports = {
  getAllCategories,
  refreshCategories,
  getCustomCategories,
  addCustomCategory,
  deleteCustomCategory
};
