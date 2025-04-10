const logger = require('../utils/logger');

/**
 * Export all data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const exportData = (req, res, next) => {
  try {
    // Get data from other controllers
    const bookmarkController = require('./bookmarkController');
    const categoryController = require('./categoryController');
    
    const bookmarks = bookmarkController.getAllBookmarks({}, { json: (data) => data }, {});
    const archivedBookmarks = bookmarkController.getArchivedBookmarks({}, { json: (data) => data }, {});
    const categories = categoryController.getAllCategories({}, { json: (data) => data }, {});
    const customCategories = categoryController.getCustomCategories({}, { json: (data) => data }, {});
    
    // Combine all data
    const exportData = {
      bookmarks,
      archivedBookmarks,
      categories,
      customCategories,
      exportDate: new Date().toISOString()
    };
    
    res.status(200).json(exportData);
  } catch (error) {
    logger.error(`Error exporting data: ${error.message}`);
    next(error);
  }
};

/**
 * Import data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const importData = (req, res, next) => {
  try {
    const importData = req.body;
    
    // Validate import data
    if (!importData || typeof importData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid import data' 
      });
    }
    
    // Get references to other controllers
    const bookmarkController = require('./bookmarkController');
    const categoryController = require('./categoryController');
    const suggestionController = require('./suggestionController');
    
    // Import bookmarks
    if (Array.isArray(importData.bookmarks)) {
      // Replace the bookmarks array in the controller
      bookmarkController.bookmarks = importData.bookmarks;
    }
    
    // Import archived bookmarks
    if (Array.isArray(importData.archivedBookmarks)) {
      // Replace the archivedBookmarks array in the controller
      bookmarkController.archivedBookmarks = importData.archivedBookmarks;
    }
    
    // Import categories
    if (Array.isArray(importData.categories)) {
      // Replace the categories array in the controller
      categoryController.categories = importData.categories;
    }
    
    // Import custom categories
    if (Array.isArray(importData.customCategories)) {
      // Replace the customCategories array in the controller
      categoryController.customCategories = importData.customCategories;
    }
    
    // Clear suggestions cache
    suggestionController.clearSuggestionsCache();
    
    res.status(200).json({ 
      success: true, 
      message: 'Data imported successfully' 
    });
  } catch (error) {
    logger.error(`Error importing data: ${error.message}`);
    next(error);
  }
};

/**
 * Reset all data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetData = (req, res, next) => {
  try {
    // Get references to other controllers
    const bookmarkController = require('./bookmarkController');
    const categoryController = require('./categoryController');
    const suggestionController = require('./suggestionController');
    
    // Reset bookmarks
    bookmarkController.bookmarks = [];
    bookmarkController.archivedBookmarks = [];
    
    // Reset custom categories (keep default categories)
    categoryController.customCategories = [];
    
    // Clear suggestions cache
    suggestionController.clearSuggestionsCache();
    
    res.status(200).json({ 
      success: true, 
      message: 'All data has been reset' 
    });
  } catch (error) {
    logger.error(`Error resetting data: ${error.message}`);
    next(error);
  }
};

module.exports = {
  exportData,
  importData,
  resetData
};
