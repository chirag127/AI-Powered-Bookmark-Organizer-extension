const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// In-memory storage for bookmarks (in a real app, this would be a database)
let bookmarks = [];
let archivedBookmarks = [];

/**
 * Get all bookmarks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllBookmarks = (req, res, next) => {
  try {
    res.status(200).json(bookmarks);
  } catch (error) {
    next(error);
  }
};

/**
 * Get archived bookmarks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getArchivedBookmarks = (req, res, next) => {
  try {
    res.status(200).json(archivedBookmarks);
  } catch (error) {
    next(error);
  }
};

/**
 * Categorize bookmarks using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const categorizeBookmarks = async (req, res, next) => {
  try {
    const { bookmarks: newBookmarks } = req.body;
    
    if (!Array.isArray(newBookmarks)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bookmarks must be an array' 
      });
    }
    
    // Process each bookmark in parallel
    const categorizedBookmarks = await Promise.all(
      newBookmarks.map(bookmark => geminiService.categorizeBookmark(bookmark))
    );
    
    // Add to bookmarks array, replacing any with the same ID
    categorizedBookmarks.forEach(newBookmark => {
      const index = bookmarks.findIndex(b => b.id === newBookmark.id);
      if (index !== -1) {
        bookmarks[index] = newBookmark;
      } else {
        bookmarks.push(newBookmark);
      }
    });
    
    res.status(200).json(categorizedBookmarks);
  } catch (error) {
    logger.error(`Error categorizing bookmarks: ${error.message}`);
    next(error);
  }
};

/**
 * Update a bookmark
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the bookmark
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bookmark not found' 
      });
    }
    
    // Update the bookmark
    bookmarks[bookmarkIndex] = {
      ...bookmarks[bookmarkIndex],
      ...updateData
    };
    
    // If title or URL changed, re-categorize
    if (updateData.title || updateData.url) {
      bookmarks[bookmarkIndex] = await geminiService.categorizeBookmark(bookmarks[bookmarkIndex]);
    }
    
    res.status(200).json(bookmarks[bookmarkIndex]);
  } catch (error) {
    next(error);
  }
};

/**
 * Archive a bookmark
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const archiveBookmark = (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the bookmark
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bookmark not found' 
      });
    }
    
    // Move to archived bookmarks
    const bookmark = bookmarks[bookmarkIndex];
    archivedBookmarks.push({
      ...bookmark,
      archivedAt: Date.now()
    });
    
    // Remove from active bookmarks
    bookmarks.splice(bookmarkIndex, 1);
    
    res.status(200).json({ 
      success: true, 
      message: 'Bookmark archived successfully' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive multiple bookmarks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const archiveBookmarksBatch = (req, res, next) => {
  try {
    const { bookmarkIds } = req.body;
    
    if (!Array.isArray(bookmarkIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'bookmarkIds must be an array' 
      });
    }
    
    // Find bookmarks to archive
    const bookmarksToArchive = bookmarks.filter(b => bookmarkIds.includes(b.id));
    
    // Move to archived bookmarks
    bookmarksToArchive.forEach(bookmark => {
      archivedBookmarks.push({
        ...bookmark,
        archivedAt: Date.now()
      });
    });
    
    // Remove from active bookmarks
    bookmarks = bookmarks.filter(b => !bookmarkIds.includes(b.id));
    
    res.status(200).json({ 
      success: true, 
      message: `${bookmarksToArchive.length} bookmarks archived successfully` 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a bookmark from archive
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const restoreBookmark = (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the archived bookmark
    const archivedIndex = archivedBookmarks.findIndex(b => b.id === id);
    
    if (archivedIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Archived bookmark not found' 
      });
    }
    
    // Move to active bookmarks
    const bookmark = archivedBookmarks[archivedIndex];
    const { archivedAt, ...restoredBookmark } = bookmark;
    bookmarks.push(restoredBookmark);
    
    // Remove from archived bookmarks
    archivedBookmarks.splice(archivedIndex, 1);
    
    res.status(200).json({ 
      success: true, 
      message: 'Bookmark restored successfully' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a bookmark
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteBookmark = (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Remove from active bookmarks
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    if (bookmarkIndex !== -1) {
      bookmarks.splice(bookmarkIndex, 1);
    }
    
    // Remove from archived bookmarks
    const archivedIndex = archivedBookmarks.findIndex(b => b.id === id);
    if (archivedIndex !== -1) {
      archivedBookmarks.splice(archivedIndex, 1);
    }
    
    // If not found in either, it's already deleted
    res.status(200).json({ 
      success: true, 
      message: 'Bookmark deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookmarks,
  getArchivedBookmarks,
  categorizeBookmarks,
  updateBookmark,
  archiveBookmark,
  archiveBookmarksBatch,
  restoreBookmark,
  deleteBookmark
};
