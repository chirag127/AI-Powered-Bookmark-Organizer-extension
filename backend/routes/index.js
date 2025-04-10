const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const categoryController = require('../controllers/categoryController');
const suggestionController = require('../controllers/suggestionController');
const dataController = require('../controllers/dataController');

// Bookmark routes
router.get('/bookmarks', bookmarkController.getAllBookmarks);
router.get('/bookmarks/archived', bookmarkController.getArchivedBookmarks);
router.post('/bookmarks/categorize', bookmarkController.categorizeBookmarks);
router.put('/bookmarks/archive-batch', bookmarkController.archiveBookmarksBatch);
router.put('/bookmarks/:id', bookmarkController.updateBookmark);
router.put('/bookmarks/:id/archive', bookmarkController.archiveBookmark);
router.put('/bookmarks/:id/restore', bookmarkController.restoreBookmark);
router.delete('/bookmarks/:id', bookmarkController.deleteBookmark);

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/refresh', categoryController.refreshCategories);
router.get('/categories/custom', categoryController.getCustomCategories);
router.post('/categories/custom', categoryController.addCustomCategory);
router.delete('/categories/custom/:id', categoryController.deleteCustomCategory);

// Suggestion routes
router.get('/suggestions', suggestionController.getSuggestions);

// Data management routes
router.get('/export', dataController.exportData);
router.post('/import', dataController.importData);
router.post('/reset', dataController.resetData);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
