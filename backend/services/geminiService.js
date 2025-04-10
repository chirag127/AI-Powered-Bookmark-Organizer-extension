const logger = require('../utils/logger');

/**
 * Service for interacting with the Gemini API
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-1.5-flash-latest'; // Using the Flash Lite model
  }

  /**
   * Categorize a bookmark using Gemini AI
   * @param {Object} bookmark - The bookmark to categorize
   * @param {string} bookmark.title - The bookmark title
   * @param {string} bookmark.url - The bookmark URL
   * @param {string} bookmark.content - The bookmark page content (optional)
   * @returns {Promise<Object>} - The categorization result
   */
  async categorizeBookmark(bookmark) {
    try {
      logger.info(`Categorizing bookmark: ${bookmark.title}`);
      
      // Prepare the prompt for Gemini
      const prompt = `
        Please analyze this bookmark and provide appropriate categories and tags.
        
        Title: ${bookmark.title}
        URL: ${bookmark.url}
        ${bookmark.content ? `Content: ${bookmark.content.substring(0, 1000)}...` : ''}
        
        Return the result as JSON with the following structure:
        {
          "categories": ["category1", "category2"],
          "tags": ["tag1", "tag2", "tag3"],
          "summary": "A brief summary of the bookmark content"
        }
      `;
      
      // In a real implementation, this would call the Gemini API
      // For now, we'll simulate a response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response based on the bookmark title and URL
      const mockResponse = this._generateMockResponse(bookmark);
      
      logger.debug(`Categorization result for ${bookmark.title}:`, mockResponse);
      
      return mockResponse;
    } catch (error) {
      logger.error(`Error categorizing bookmark: ${error.message}`, { error });
      throw new Error(`Failed to categorize bookmark: ${error.message}`);
    }
  }
  
  /**
   * Generate content suggestions based on user's bookmarks
   * @param {Array} bookmarks - Array of user's bookmarks
   * @returns {Promise<Array>} - Array of content suggestions
   */
  async generateSuggestions(bookmarks) {
    try {
      logger.info(`Generating suggestions based on ${bookmarks.length} bookmarks`);
      
      // In a real implementation, this would call the Gemini API
      // For now, we'll simulate a response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock suggestions
      const suggestions = [
        {
          title: 'Introduction to AI',
          url: 'https://example.com/ai-intro',
          relevance: 'Based on your Technology bookmarks'
        },
        {
          title: 'Latest Space Discoveries',
          url: 'https://example.com/space-news',
          relevance: 'Based on your Science bookmarks'
        },
        {
          title: 'Web Development Trends 2023',
          url: 'https://example.com/webdev-trends',
          relevance: 'Based on your recent browsing'
        }
      ];
      
      logger.debug(`Generated ${suggestions.length} suggestions`);
      
      return suggestions;
    } catch (error) {
      logger.error(`Error generating suggestions: ${error.message}`, { error });
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
  }
  
  /**
   * Generate a mock response for testing
   * @private
   * @param {Object} bookmark - The bookmark
   * @returns {Object} - Mock categorization result
   */
  _generateMockResponse(bookmark) {
    const title = bookmark.title.toLowerCase();
    const url = bookmark.url.toLowerCase();
    
    // Technology related
    if (title.includes('javascript') || title.includes('programming') || 
        url.includes('github') || url.includes('stackoverflow')) {
      return {
        categories: ['Technology', 'Programming'],
        tags: ['JavaScript', 'Web Development', 'Coding'],
        summary: 'A programming resource related to web development and JavaScript.'
      };
    }
    
    // Science related
    if (title.includes('science') || title.includes('physics') || 
        url.includes('nasa') || url.includes('nature')) {
      return {
        categories: ['Science', 'Education'],
        tags: ['Physics', 'Research', 'Academic'],
        summary: 'A scientific resource with educational content.'
      };
    }
    
    // News related
    if (title.includes('news') || url.includes('news') || 
        url.includes('bbc') || url.includes('cnn')) {
      return {
        categories: ['News', 'Current Events'],
        tags: ['Media', 'Journalism', 'Updates'],
        summary: 'A news article covering current events.'
      };
    }
    
    // Default response
    return {
      categories: ['Miscellaneous', 'General'],
      tags: ['Information', 'Resource', 'Reference'],
      summary: 'A general information resource.'
    };
  }
}

module.exports = new GeminiService();
