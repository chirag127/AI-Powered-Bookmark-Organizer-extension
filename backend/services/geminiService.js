const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

/**
 * Categorize a bookmark using Gemini AI
 * @param {Object} bookmark - Bookmark object with title and URL
 * @returns {Promise<Object>} - Categorized bookmark with category and tags
 */
async function categorizeBookmark(bookmark) {
  try {
    const prompt = `
      Analyze this bookmark and provide a single category and up to 5 relevant tags.
      
      Bookmark Title: ${bookmark.title}
      Bookmark URL: ${bookmark.url}
      
      Respond in JSON format with the following structure:
      {
        "category": "Main Category",
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
      }
      
      Choose the category from common bookmark categories like Technology, Science, News, Education, 
      Entertainment, Finance, Health, Travel, Shopping, Social Media, etc.
      
      Tags should be specific keywords related to the content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const categorization = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!categorization.category || !Array.isArray(categorization.tags)) {
      throw new Error('Invalid AI response format');
    }
    
    // Limit tags to 5
    categorization.tags = categorization.tags.slice(0, 5);
    
    return {
      ...bookmark,
      category: categorization.category,
      tags: categorization.tags
    };
  } catch (error) {
    logger.error(`Error categorizing bookmark: ${error.message}`, { bookmark });
    
    // Return a default categorization if AI fails
    return {
      ...bookmark,
      category: 'Uncategorized',
      tags: []
    };
  }
}

/**
 * Generate content suggestions based on bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @returns {Promise<Array>} - Array of suggested content
 */
async function generateSuggestions(bookmarks) {
  try {
    // Get the most recent 10 bookmarks for context
    const recentBookmarks = bookmarks
      .sort((a, b) => b.dateAdded - a.dateAdded)
      .slice(0, 10);
    
    // Create a context string from the bookmarks
    const bookmarksContext = recentBookmarks
      .map(b => `Title: ${b.title}\nCategory: ${b.category}\nTags: ${b.tags.join(', ')}`)
      .join('\n\n');
    
    const prompt = `
      Based on the following bookmarks, suggest 5 related web pages that the user might find interesting.
      
      User's Recent Bookmarks:
      ${bookmarksContext}
      
      Provide 5 suggestions in JSON format with the following structure:
      [
        {
          "title": "Suggested Page Title",
          "url": "https://example.com/page",
          "reason": "Brief explanation of why this is relevant to the user's interests"
        }
      ]
      
      Make sure the suggestions are diverse but relevant to the user's interests as shown in their bookmarks.
      Ensure all URLs are valid and working websites.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid AI response format');
    }
    
    // Ensure each suggestion has the required fields
    return suggestions.filter(suggestion => 
      suggestion.title && 
      suggestion.url && 
      suggestion.reason &&
      suggestion.url.startsWith('http')
    ).slice(0, 5);
  } catch (error) {
    logger.error(`Error generating suggestions: ${error.message}`);
    
    // Return empty array if AI fails
    return [];
  }
}

/**
 * Generate categories based on bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @returns {Promise<Array>} - Array of category objects
 */
async function generateCategories(bookmarks) {
  try {
    // Get unique categories from bookmarks
    const existingCategories = [...new Set(bookmarks.map(b => b.category))];
    
    // Create a context string from the bookmarks
    const bookmarksContext = bookmarks
      .slice(0, 20)
      .map(b => `Title: ${b.title}\nURL: ${b.url}`)
      .join('\n\n');
    
    const prompt = `
      Based on the following bookmarks, generate a list of 10-15 useful categories for organizing them.
      Include the existing categories and suggest new ones that would be helpful.
      
      Existing Categories: ${existingCategories.join(', ')}
      
      Sample Bookmarks:
      ${bookmarksContext}
      
      Provide the categories in JSON format with the following structure:
      [
        {
          "name": "Category Name",
          "description": "Brief description of what belongs in this category"
        }
      ]
      
      Make sure the categories are diverse and cover different topics.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const categories = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!Array.isArray(categories)) {
      throw new Error('Invalid AI response format');
    }
    
    // Ensure each category has the required fields
    return categories.filter(category => 
      category.name && 
      category.description
    );
  } catch (error) {
    logger.error(`Error generating categories: ${error.message}`);
    
    // Return default categories if AI fails
    return [
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
  }
}

module.exports = {
  categorizeBookmark,
  generateSuggestions,
  generateCategories
};
