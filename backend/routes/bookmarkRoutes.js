const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');

const router = express.Router();

/**
 * @route   POST /api/bookmarks/categorize
 * @desc    Categorize a bookmark using AI
 * @access  Public
 */
router.post('/categorize', bookmarkController.categorizeBookmark);

/**
 * @route   POST /api/bookmarks/suggestions
 * @desc    Get content suggestions based on user's bookmarks
 * @access  Public
 */
router.post('/suggestions', bookmarkController.getSuggestions);

module.exports = router;
