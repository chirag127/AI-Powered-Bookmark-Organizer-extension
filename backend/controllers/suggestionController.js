const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// Cache for suggestions to avoid frequent API calls
let suggestionsCache = {
  data: [],
  timestamp: 0
};

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Get content suggestions based on bookmarks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSuggestions = async (req, res, next) => {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (suggestionsCache.data.length > 0 && now - suggestionsCache.timestamp < CACHE_EXPIRATION) {
      return res.status(200).json(suggestionsCache.data);
    }
    
    // Get bookmarks from the bookmark controller
    const bookmarkController = require('./bookmarkController');
    const bookmarks = bookmarkController.getAllBookmarks({}, { json: (data) => data }, {});
    
    // If no bookmarks, return empty array
    if (!bookmarks || bookmarks.length === 0) {
      return res.status(200).json([]);
    }
    
    // Generate suggestions based on bookmarks
    const suggestions = await geminiService.generateSuggestions(bookmarks);
    
    // Update cache
    suggestionsCache = {
      data: suggestions,
      timestamp: now
    };
    
    res.status(200).json(suggestions);
  } catch (error) {
    logger.error(`Error getting suggestions: ${error.message}`);
    next(error);
  }
};

/**
 * Clear suggestions cache
 */
const clearSuggestionsCache = () => {
  suggestionsCache = {
    data: [],
    timestamp: 0
  };
};

module.exports = {
  getSuggestions,
  clearSuggestionsCache
};
