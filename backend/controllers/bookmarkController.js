const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

/**
 * Controller for bookmark-related operations
 */
class BookmarkController {
  /**
   * Categorize a bookmark
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async categorizeBookmark(req, res, next) {
    try {
      const { title, url, content } = req.body;
      
      // Validate required fields
      if (!title || !url) {
        return res.status(400).json({
          success: false,
          message: 'Title and URL are required'
        });
      }
      
      logger.info(`Received categorization request for: ${title}`);
      
      // Call Gemini service to categorize the bookmark
      const result = await geminiService.categorizeBookmark({
        title,
        url,
        content
      });
      
      // Return the categorization result
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Error in categorizeBookmark: ${error.message}`, { error });
      next(error);
    }
  }
  
  /**
   * Get content suggestions based on user's bookmarks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSuggestions(req, res, next) {
    try {
      const { bookmarks } = req.body;
      
      // Validate bookmarks array
      if (!bookmarks || !Array.isArray(bookmarks) || bookmarks.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid bookmarks array is required'
        });
      }
      
      logger.info(`Received suggestions request with ${bookmarks.length} bookmarks`);
      
      // Call Gemini service to generate suggestions
      const suggestions = await geminiService.generateSuggestions(bookmarks);
      
      // Return the suggestions
      return res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error(`Error in getSuggestions: ${error.message}`, { error });
      next(error);
    }
  }
}

module.exports = new BookmarkController();
