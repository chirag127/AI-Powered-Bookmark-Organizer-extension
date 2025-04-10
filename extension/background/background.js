// Background script for AI-Powered Bookmark Organizer

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // First time installation
    initializeExtension();
  } else if (details.reason === 'update') {
    // Extension updated
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Extension updated to version ${currentVersion}`);
  }
});

// Listen for bookmark creation
chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
  // Check if auto-categorization is enabled
  chrome.storage.sync.get(['autoCategorize'], function(result) {
    if (result.autoCategorize !== false) {
      categorizeBookmark(bookmark);
    }
  });
});

// Listen for messages from popup or options page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'categorizeBookmark') {
    categorizeBookmark(request.bookmark, sendResponse);
    return true; // Keep the message channel open for async response
  } else if (request.action === 'getSuggestions') {
    getSuggestions(sendResponse);
    return true; // Keep the message channel open for async response
  } else if (request.action === 'archiveOldBookmarks') {
    archiveOldBookmarks(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Function to initialize extension
function initializeExtension() {
  // Set default options
  chrome.storage.sync.set({
    autoCategorize: true,
    suggestContent: true,
    archiveBookmarks: true,
    archiveThreshold: '90',
    excludeFolders: ['important'],
    categories: ['Technology', 'Science', 'News', 'Entertainment', 'Education']
  }, function() {
    console.log('Default options set');
  });
  
  // Create necessary bookmark folders
  chrome.bookmarks.getTree(function(bookmarkTree) {
    const otherBookmarks = bookmarkTree[0].children[1]; // "Other Bookmarks" folder
    
    // Create main folder
    chrome.bookmarks.create({
      parentId: otherBookmarks.id,
      title: 'AI Organized'
    }, function(folder) {
      // Create Archive folder
      chrome.bookmarks.create({
        parentId: folder.id,
        title: 'Archive'
      });
      
      // Create Categories folder
      chrome.bookmarks.create({
        parentId: folder.id,
        title: 'Categories'
      }, function(categoriesFolder) {
        // Create default category folders
        const defaultCategories = ['Technology', 'Science', 'News', 'Entertainment', 'Education'];
        defaultCategories.forEach(category => {
          chrome.bookmarks.create({
            parentId: categoriesFolder.id,
            title: category
          });
        });
      });
    });
  });
}

// Function to categorize a bookmark
function categorizeBookmark(bookmark, callback) {
  // This is a placeholder function
  // In a real implementation, this would send the bookmark to the backend for AI processing
  console.log(`Categorizing bookmark: ${bookmark.title} - ${bookmark.url}`);
  
  // Simulate API call to backend
  setTimeout(function() {
    // Simulate categorization result
    const categories = ['Technology', 'Education'];
    const tags = ['JavaScript', 'Web Development', 'Tutorial'];
    
    // Store categorization result
    chrome.storage.local.get(['bookmarkData'], function(result) {
      const bookmarkData = result.bookmarkData || {};
      bookmarkData[bookmark.id] = {
        url: bookmark.url,
        title: bookmark.title,
        dateAdded: bookmark.dateAdded || Date.now(),
        categories: categories,
        tags: tags,
        lastAccessed: Date.now()
      };
      
      chrome.storage.local.set({ bookmarkData: bookmarkData }, function() {
        console.log(`Bookmark ${bookmark.id} categorized`);
        
        // Call callback if provided
        if (callback) {
          callback({
            success: true,
            categories: categories,
            tags: tags
          });
        }
      });
    });
  }, 1000); // Simulate delay
}

// Function to get content suggestions
function getSuggestions(callback) {
  // This is a placeholder function
  // In a real implementation, this would get suggestions from the backend
  console.log('Getting content suggestions');
  
  // Simulate API call to backend
  setTimeout(function() {
    // Simulate suggestions
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
    
    // Call callback with suggestions
    if (callback) {
      callback({
        success: true,
        suggestions: suggestions
      });
    }
  }, 1000); // Simulate delay
}

// Function to archive old bookmarks
function archiveOldBookmarks(callback) {
  // This is a placeholder function
  // In a real implementation, this would archive bookmarks based on settings
  console.log('Archiving old bookmarks');
  
  // Get archive settings
  chrome.storage.sync.get(['archiveBookmarks', 'archiveThreshold', 'excludeFolders'], function(settings) {
    if (!settings.archiveBookmarks) {
      if (callback) {
        callback({
          success: true,
          message: 'Archiving is disabled',
          archivedCount: 0
        });
      }
      return;
    }
    
    // Get bookmark data
    chrome.storage.local.get(['bookmarkData'], function(result) {
      const bookmarkData = result.bookmarkData || {};
      const now = Date.now();
      const thresholdDays = parseInt(settings.archiveThreshold) || 90;
      const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
      let archivedCount = 0;
      
      // Find bookmarks to archive
      Object.keys(bookmarkData).forEach(id => {
        const data = bookmarkData[id];
        const lastAccessed = data.lastAccessed || data.dateAdded;
        
        // Check if bookmark is old enough to archive
        if (now - lastAccessed > thresholdMs) {
          // In a real implementation, this would move the bookmark to the Archive folder
          console.log(`Archiving bookmark: ${data.title}`);
          archivedCount++;
        }
      });
      
      // Call callback with result
      if (callback) {
        callback({
          success: true,
          message: `Archived ${archivedCount} bookmarks`,
          archivedCount: archivedCount
        });
      }
    });
  });
}

// Schedule periodic tasks
setInterval(function() {
  // Check if archiving is enabled
  chrome.storage.sync.get(['archiveBookmarks'], function(result) {
    if (result.archiveBookmarks !== false) {
      archiveOldBookmarks();
    }
  });
}, 24 * 60 * 60 * 1000); // Run once a day
