// API endpoint
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const categoriesList = document.getElementById('categories-list');
const bookmarksList = document.getElementById('bookmarks-list');
const suggestionsList = document.getElementById('suggestions-list');
const archiveList = document.getElementById('archive-list');
const refreshCategoriesButton = document.getElementById('refresh-categories');
const sortFilter = document.getElementById('sort-filter');
const settingsButton = document.getElementById('settings-button');
const addBookmarkButton = document.getElementById('add-bookmark-button');

// State
let bookmarks = [];
let categories = [];
let currentCategory = null;
let isLoading = false;

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  loadBookmarks();
  loadCategories();
  loadSuggestions();
  loadArchivedBookmarks();
  setupEventListeners();
});

// Initialize tabs
function initializeTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active tab content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Search
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Refresh categories
  refreshCategoriesButton.addEventListener('click', () => {
    loadCategories(true);
  });
  
  // Sort filter
  sortFilter.addEventListener('change', () => {
    renderBookmarks(bookmarks);
  });
  
  // Settings button
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Add bookmark button
  addBookmarkButton.addEventListener('click', addCurrentPageBookmark);
}

// Load bookmarks from Chrome API and categorize them
async function loadBookmarks() {
  setLoading(bookmarksList, true);
  
  try {
    // Get bookmarks from Chrome API
    const chromeBookmarks = await getChromeBookmarks();
    
    // Get categorized bookmarks from backend
    const response = await fetch(`${API_BASE_URL}/bookmarks`);
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    
    bookmarks = await response.json();
    
    // If there are new bookmarks that haven't been categorized yet, send them to the backend
    const uncategorizedBookmarks = findUncategorizedBookmarks(chromeBookmarks, bookmarks);
    if (uncategorizedBookmarks.length > 0) {
      await categorizeBookmarks(uncategorizedBookmarks);
      // Reload bookmarks after categorization
      await loadBookmarks();
      return;
    }
    
    renderBookmarks(bookmarks);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    bookmarksList.innerHTML = `<div class="error">Error loading bookmarks: ${error.message}</div>`;
  } finally {
    setLoading(bookmarksList, false);
  }
}

// Get bookmarks from Chrome API
function getChromeBookmarks() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      const bookmarks = flattenBookmarkTree(bookmarkTreeNodes);
      resolve(bookmarks);
    });
  });
}

// Flatten bookmark tree into an array
function flattenBookmarkTree(bookmarkTreeNodes) {
  let bookmarks = [];
  
  function traverse(node) {
    if (node.url) {
      bookmarks.push({
        id: node.id,
        title: node.title,
        url: node.url,
        dateAdded: node.dateAdded
      });
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  bookmarkTreeNodes.forEach(traverse);
  return bookmarks;
}

// Find bookmarks that haven't been categorized yet
function findUncategorizedBookmarks(chromeBookmarks, categorizedBookmarks) {
  const categorizedIds = new Set(categorizedBookmarks.map(b => b.id));
  return chromeBookmarks.filter(bookmark => !categorizedIds.has(bookmark.id));
}

// Send bookmarks to backend for categorization
async function categorizeBookmarks(bookmarks) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookmarks })
    });
    
    if (!response.ok) throw new Error('Failed to categorize bookmarks');
    
    return await response.json();
  } catch (error) {
    console.error('Error categorizing bookmarks:', error);
    throw error;
  }
}

// Render bookmarks in the UI
function renderBookmarks(bookmarks) {
  if (bookmarks.length === 0) {
    bookmarksList.innerHTML = '<div class="empty-state">No bookmarks found</div>';
    return;
  }
  
  // Filter by category if one is selected
  let filteredBookmarks = bookmarks;
  if (currentCategory) {
    filteredBookmarks = bookmarks.filter(bookmark => 
      bookmark.category === currentCategory || 
      bookmark.tags.includes(currentCategory)
    );
  }
  
  // Filter by search term if present
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    filteredBookmarks = filteredBookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm) || 
      bookmark.url.toLowerCase().includes(searchTerm) ||
      (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Sort bookmarks
  const sortBy = sortFilter.value;
  filteredBookmarks = sortBookmarks(filteredBookmarks, sortBy);
  
  // Render bookmarks
  bookmarksList.innerHTML = filteredBookmarks.map(bookmark => `
    <div class="bookmark-item" data-id="${bookmark.id}">
      <div class="bookmark-header">
        <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" alt="Favicon">
        <a href="${bookmark.url}" class="bookmark-title" target="_blank" title="${bookmark.title}">${bookmark.title}</a>
        <div class="bookmark-actions">
          <button class="bookmark-action-button edit-bookmark" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="bookmark-action-button archive-bookmark" title="Archive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="bookmark-url">${bookmark.url}</div>
      <div class="bookmark-tags">
        <span class="bookmark-tag">${bookmark.category}</span>
        ${bookmark.tags.map(tag => `<span class="bookmark-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  // Add event listeners to bookmark actions
  document.querySelectorAll('.edit-bookmark').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const bookmarkId = e.target.closest('.bookmark-item').getAttribute('data-id');
      editBookmark(bookmarkId);
    });
  });
  
  document.querySelectorAll('.archive-bookmark').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const bookmarkId = e.target.closest('.bookmark-item').getAttribute('data-id');
      archiveBookmark(bookmarkId);
    });
  });
}

// Sort bookmarks based on selected filter
function sortBookmarks(bookmarks, sortBy) {
  switch (sortBy) {
    case 'recent':
      return [...bookmarks].sort((a, b) => b.dateAdded - a.dateAdded);
    case 'name':
      return [...bookmarks].sort((a, b) => a.title.localeCompare(b.title));
    case 'category':
      return [...bookmarks].sort((a, b) => a.category.localeCompare(b.category));
    default:
      return bookmarks;
  }
}

// Load categories from backend
async function loadCategories(forceRefresh = false) {
  setLoading(categoriesList, true);
  
  try {
    const url = forceRefresh 
      ? `${API_BASE_URL}/categories/refresh` 
      : `${API_BASE_URL}/categories`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch categories');
    
    categories = await response.json();
    renderCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
    categoriesList.innerHTML = `<div class="error">Error loading categories: ${error.message}</div>`;
  } finally {
    setLoading(categoriesList, false);
  }
}

// Render categories in the UI
function renderCategories(categories) {
  if (categories.length === 0) {
    categoriesList.innerHTML = '<div class="empty-state">No categories found</div>';
    return;
  }
  
  categoriesList.innerHTML = `
    <div class="category-item ${!currentCategory ? 'active' : ''}" data-category="all">
      <div class="category-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
      <div class="category-name">All Bookmarks</div>
      <div class="category-count">${bookmarks.length}</div>
    </div>
    ${categories.map(category => {
      const count = bookmarks.filter(b => b.category === category.name || b.tags.includes(category.name)).length;
      return `
        <div class="category-item ${currentCategory === category.name ? 'active' : ''}" data-category="${category.name}">
          <div class="category-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="category-name">${category.name}</div>
          <div class="category-count">${count}</div>
        </div>
      `;
    }).join('')}
  `;
  
  // Add event listeners to category items
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');
      currentCategory = category === 'all' ? null : category;
      
      // Update active category
      document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Re-render bookmarks with the selected category
      renderBookmarks(bookmarks);
    });
  });
}

// Load suggestions from backend
async function loadSuggestions() {
  setLoading(suggestionsList, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/suggestions`);
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    
    const suggestions = await response.json();
    renderSuggestions(suggestions);
  } catch (error) {
    console.error('Error loading suggestions:', error);
    suggestionsList.innerHTML = `<div class="error">Error loading suggestions: ${error.message}</div>`;
  } finally {
    setLoading(suggestionsList, false);
  }
}

// Render suggestions in the UI
function renderSuggestions(suggestions) {
  if (suggestions.length === 0) {
    suggestionsList.innerHTML = '<div class="empty-state">No suggestions available</div>';
    return;
  }
  
  suggestionsList.innerHTML = suggestions.map(suggestion => `
    <div class="bookmark-item suggestion-item">
      <div class="bookmark-header">
        <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${new URL(suggestion.url).hostname}" alt="Favicon">
        <a href="${suggestion.url}" class="bookmark-title" target="_blank" title="${suggestion.title}">${suggestion.title}</a>
        <div class="bookmark-actions">
          <button class="bookmark-action-button add-suggestion" title="Add to Bookmarks" data-url="${suggestion.url}" data-title="${suggestion.title}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="bookmark-url">${suggestion.url}</div>
      <div class="suggestion-reason">${suggestion.reason}</div>
    </div>
  `).join('');
  
  // Add event listeners to suggestion actions
  document.querySelectorAll('.add-suggestion').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const url = e.target.getAttribute('data-url');
      const title = e.target.getAttribute('data-title');
      addBookmark(url, title);
    });
  });
}

// Load archived bookmarks from backend
async function loadArchivedBookmarks() {
  setLoading(archiveList, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/archived`);
    if (!response.ok) throw new Error('Failed to fetch archived bookmarks');
    
    const archivedBookmarks = await response.json();
    renderArchivedBookmarks(archivedBookmarks);
  } catch (error) {
    console.error('Error loading archived bookmarks:', error);
    archiveList.innerHTML = `<div class="error">Error loading archived bookmarks: ${error.message}</div>`;
  } finally {
    setLoading(archiveList, false);
  }
}

// Render archived bookmarks in the UI
function renderArchivedBookmarks(archivedBookmarks) {
  if (archivedBookmarks.length === 0) {
    archiveList.innerHTML = '<div class="empty-state">No archived bookmarks</div>';
    return;
  }
  
  archiveList.innerHTML = archivedBookmarks.map(bookmark => `
    <div class="bookmark-item" data-id="${bookmark.id}">
      <div class="bookmark-header">
        <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" alt="Favicon">
        <a href="${bookmark.url}" class="bookmark-title" target="_blank" title="${bookmark.title}">${bookmark.title}</a>
        <div class="bookmark-actions">
          <button class="bookmark-action-button restore-bookmark" title="Restore">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
          <button class="bookmark-action-button delete-bookmark" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="bookmark-url">${bookmark.url}</div>
      <div class="bookmark-tags">
        <span class="bookmark-tag">${bookmark.category}</span>
        ${bookmark.tags.map(tag => `<span class="bookmark-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  // Add event listeners to archived bookmark actions
  document.querySelectorAll('.restore-bookmark').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const bookmarkId = e.target.closest('.bookmark-item').getAttribute('data-id');
      restoreBookmark(bookmarkId);
    });
  });
  
  document.querySelectorAll('.delete-bookmark').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const bookmarkId = e.target.closest('.bookmark-item').getAttribute('data-id');
      deleteBookmark(bookmarkId);
    });
  });
}

// Handle search
function handleSearch() {
  renderBookmarks(bookmarks);
}

// Add current page as bookmark
function addCurrentPageBookmark() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    await addBookmark(tab.url, tab.title);
  });
}

// Add a bookmark
async function addBookmark(url, title) {
  try {
    // First add to Chrome bookmarks
    const bookmarkId = await addChromeBookmark(url, title);
    
    // Then categorize it
    await categorizeBookmarks([{ id: bookmarkId, url, title, dateAdded: Date.now() }]);
    
    // Reload bookmarks
    await loadBookmarks();
    
    // Show success message
    showNotification('Bookmark added successfully', 'success');
  } catch (error) {
    console.error('Error adding bookmark:', error);
    showNotification(`Error adding bookmark: ${error.message}`, 'error');
  }
}

// Add a bookmark to Chrome
function addChromeBookmark(url, title) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.create({ title, url }, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result.id);
    });
  });
}

// Edit a bookmark
function editBookmark(bookmarkId) {
  const bookmark = bookmarks.find(b => b.id === bookmarkId);
  if (!bookmark) return;
  
  // Open edit dialog or navigate to edit page
  // For now, we'll just show a notification
  showNotification('Edit functionality coming soon', 'info');
}

// Archive a bookmark
async function archiveBookmark(bookmarkId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmarkId}/archive`, {
      method: 'PUT'
    });
    
    if (!response.ok) throw new Error('Failed to archive bookmark');
    
    // Reload bookmarks and archived bookmarks
    await loadBookmarks();
    await loadArchivedBookmarks();
    
    // Show success message
    showNotification('Bookmark archived successfully', 'success');
  } catch (error) {
    console.error('Error archiving bookmark:', error);
    showNotification(`Error archiving bookmark: ${error.message}`, 'error');
  }
}

// Restore a bookmark from archive
async function restoreBookmark(bookmarkId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmarkId}/restore`, {
      method: 'PUT'
    });
    
    if (!response.ok) throw new Error('Failed to restore bookmark');
    
    // Reload bookmarks and archived bookmarks
    await loadBookmarks();
    await loadArchivedBookmarks();
    
    // Show success message
    showNotification('Bookmark restored successfully', 'success');
  } catch (error) {
    console.error('Error restoring bookmark:', error);
    showNotification(`Error restoring bookmark: ${error.message}`, 'error');
  }
}

// Delete a bookmark
async function deleteBookmark(bookmarkId) {
  try {
    // First delete from Chrome bookmarks
    await deleteChromeBookmark(bookmarkId);
    
    // Then delete from backend
    const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete bookmark from backend');
    
    // Reload archived bookmarks
    await loadArchivedBookmarks();
    
    // Show success message
    showNotification('Bookmark deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    showNotification(`Error deleting bookmark: ${error.message}`, 'error');
  }
}

// Delete a bookmark from Chrome
function deleteChromeBookmark(bookmarkId) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.remove(bookmarkId, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

// Set loading state
function setLoading(element, isLoading) {
  if (!element) return;
  
  const loadingElement = element.querySelector('.loading');
  if (isLoading) {
    if (!loadingElement) {
      element.innerHTML = '<div class="loading">Loading...</div>';
    }
  } else {
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content and type
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}
