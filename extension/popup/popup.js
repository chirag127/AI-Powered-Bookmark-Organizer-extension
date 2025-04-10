document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Add bookmark button
  const addBookmarkButton = document.getElementById('add-bookmark-button');
  addBookmarkButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      addBookmark(currentTab.url, currentTab.title);
    });
  });
  
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Search functionality
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchBookmarks(query);
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        searchBookmarks(query);
      }
    }
  });
  
  // Load initial data
  loadCategories();
  loadRecentBookmarks();
  loadSuggestions();
});

// Function to add a bookmark
function addBookmark(url, title) {
  // This is a placeholder function
  // In a real implementation, this would send the URL and title to the backend for processing
  console.log(`Adding bookmark: ${title} - ${url}`);
  
  // Show a notification
  showNotification('Bookmark added successfully!');
  
  // Reload recent bookmarks
  loadRecentBookmarks();
}

// Function to search bookmarks
function searchBookmarks(query) {
  // This is a placeholder function
  // In a real implementation, this would search through the bookmarks
  console.log(`Searching for: ${query}`);
  
  // Update the UI with search results
  const recentBookmarksContainer = document.querySelector('.recent-bookmarks');
  recentBookmarksContainer.innerHTML = `<p>Search results for "${query}" will appear here.</p>`;
}

// Function to load categories
function loadCategories() {
  // This is a placeholder function
  // In a real implementation, this would fetch categories from storage or backend
  const categories = [
    { id: 1, name: 'Technology', count: 15 },
    { id: 2, name: 'Science', count: 8 },
    { id: 3, name: 'News', count: 12 },
    { id: 4, name: 'Entertainment', count: 7 },
    { id: 5, name: 'Education', count: 10 }
  ];
  
  const categoriesContainer = document.querySelector('.categories-list');
  categoriesContainer.innerHTML = '';
  
  categories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category-item';
    categoryElement.innerHTML = `
      <h3>${category.name}</h3>
      <span>${category.count} bookmarks</span>
    `;
    categoryElement.addEventListener('click', () => {
      // Handle category click
      console.log(`Category clicked: ${category.name}`);
    });
    categoriesContainer.appendChild(categoryElement);
  });
}

// Function to load recent bookmarks
function loadRecentBookmarks() {
  // This is a placeholder function
  // In a real implementation, this would fetch recent bookmarks from storage or backend
  const bookmarks = [
    { id: 1, title: 'Google', url: 'https://www.google.com', date: '2023-07-15' },
    { id: 2, title: 'GitHub', url: 'https://github.com', date: '2023-07-14' },
    { id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com', date: '2023-07-13' },
    { id: 4, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', date: '2023-07-12' }
  ];
  
  const recentBookmarksContainer = document.querySelector('.recent-bookmarks');
  recentBookmarksContainer.innerHTML = '';
  
  bookmarks.forEach(bookmark => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.className = 'bookmark-item';
    bookmarkElement.innerHTML = `
      <h3>${bookmark.title}</h3>
      <p>${bookmark.url}</p>
      <span>Added: ${bookmark.date}</span>
    `;
    bookmarkElement.addEventListener('click', () => {
      // Open the bookmark URL
      chrome.tabs.create({ url: bookmark.url });
    });
    recentBookmarksContainer.appendChild(bookmarkElement);
  });
}

// Function to load suggestions
function loadSuggestions() {
  // This is a placeholder function
  // In a real implementation, this would fetch suggestions from the backend
  const suggestions = [
    { id: 1, title: 'Introduction to AI', url: 'https://example.com/ai-intro', relevance: 'Based on your Technology bookmarks' },
    { id: 2, title: 'Latest Space Discoveries', url: 'https://example.com/space-news', relevance: 'Based on your Science bookmarks' },
    { id: 3, title: 'Web Development Trends 2023', url: 'https://example.com/webdev-trends', relevance: 'Based on your recent browsing' }
  ];
  
  const suggestionsContainer = document.querySelector('.suggestions-list');
  suggestionsContainer.innerHTML = '';
  
  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'suggestion-item';
    suggestionElement.innerHTML = `
      <h3>${suggestion.title}</h3>
      <p>${suggestion.url}</p>
      <span>${suggestion.relevance}</span>
    `;
    suggestionElement.addEventListener('click', () => {
      // Open the suggestion URL
      chrome.tabs.create({ url: suggestion.url });
    });
    suggestionsContainer.appendChild(suggestionElement);
  });
}

// Function to show a notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
