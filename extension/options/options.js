// API endpoint
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const categoriesEnabledToggle = document.getElementById('categoriesEnabled');
const tagsEnabledToggle = document.getElementById('tagsEnabled');
const suggestionsEnabledToggle = document.getElementById('suggestionsEnabled');
const autoArchiveEnabledToggle = document.getElementById('autoArchiveEnabled');
const autoArchiveDaysInput = document.getElementById('autoArchiveDays');
const archiveDaysContainer = document.getElementById('archiveDaysContainer');
const selectFoldersButton = document.getElementById('selectFoldersButton');
const excludedFoldersList = document.getElementById('excludedFoldersList');
const customCategoriesList = document.getElementById('customCategoriesList');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryButton = document.getElementById('addCategoryButton');
const exportDataButton = document.getElementById('exportDataButton');
const importDataButton = document.getElementById('importDataButton');
const resetDataButton = document.getElementById('resetDataButton');
const saveButton = document.getElementById('saveButton');

// Modal Elements
const folderSelectionModal = document.getElementById('folderSelectionModal');
const folderTree = document.getElementById('folderTree');
const closeFolderModal = document.getElementById('closeFolderModal');
const cancelFolderSelection = document.getElementById('cancelFolderSelection');
const saveFolderSelection = document.getElementById('saveFolderSelection');

// State
let settings = {
  autoArchiveEnabled: true,
  autoArchiveDays: 180,
  suggestionsEnabled: true,
  categoriesEnabled: true,
  tagsEnabled: true,
  excludedFolders: []
};

let customCategories = [];
let selectedFolders = [];
let bookmarkFolders = [];

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadCustomCategories();
  setupEventListeners();
  updateUI();
});

// Load settings from storage
async function loadSettings() {
  try {
    const data = await chrome.storage.sync.get('settings');
    if (data.settings) {
      settings = data.settings;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Error loading settings', 'error');
  }
}

// Load custom categories from backend
async function loadCustomCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/custom`);
    if (!response.ok) throw new Error('Failed to fetch custom categories');
    
    customCategories = await response.json();
  } catch (error) {
    console.error('Error loading custom categories:', error);
    showNotification('Error loading custom categories', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle auto-archive days input visibility
  autoArchiveEnabledToggle.addEventListener('change', () => {
    archiveDaysContainer.style.display = autoArchiveEnabledToggle.checked ? 'flex' : 'none';
  });
  
  // Select folders button
  selectFoldersButton.addEventListener('click', openFolderSelectionModal);
  
  // Add category button
  addCategoryButton.addEventListener('click', addCustomCategory);
  newCategoryInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') addCustomCategory();
  });
  
  // Export data button
  exportDataButton.addEventListener('click', exportData);
  
  // Import data button
  importDataButton.addEventListener('click', importData);
  
  // Reset data button
  resetDataButton.addEventListener('click', resetData);
  
  // Save button
  saveButton.addEventListener('click', saveSettings);
  
  // Modal close buttons
  closeFolderModal.addEventListener('click', closeFolderSelectionModal);
  cancelFolderSelection.addEventListener('click', closeFolderSelectionModal);
  saveFolderSelection.addEventListener('click', saveSelectedFolders);
}

// Update UI with current settings
function updateUI() {
  // Update toggles
  categoriesEnabledToggle.checked = settings.categoriesEnabled;
  tagsEnabledToggle.checked = settings.tagsEnabled;
  suggestionsEnabledToggle.checked = settings.suggestionsEnabled;
  autoArchiveEnabledToggle.checked = settings.autoArchiveEnabled;
  
  // Update archive days
  autoArchiveDaysInput.value = settings.autoArchiveDays;
  
  // Show/hide archive days container
  archiveDaysContainer.style.display = settings.autoArchiveEnabled ? 'flex' : 'none';
  
  // Update excluded folders list
  renderExcludedFolders();
  
  // Update custom categories list
  renderCustomCategories();
}

// Render excluded folders
function renderExcludedFolders() {
  if (settings.excludedFolders.length === 0) {
    excludedFoldersList.innerHTML = '<p class="empty-state">No folders excluded</p>';
    return;
  }
  
  excludedFoldersList.innerHTML = settings.excludedFolders.map(folder => `
    <div class="folder-item" data-id="${folder.id}">
      <div class="folder-name">
        <span class="folder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </span>
        <span>${folder.title}</span>
      </div>
      <button class="remove-folder" data-id="${folder.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-folder').forEach(button => {
    button.addEventListener('click', () => {
      const folderId = button.getAttribute('data-id');
      removeExcludedFolder(folderId);
    });
  });
}

// Remove excluded folder
function removeExcludedFolder(folderId) {
  settings.excludedFolders = settings.excludedFolders.filter(folder => folder.id !== folderId);
  renderExcludedFolders();
}

// Render custom categories
function renderCustomCategories() {
  if (customCategories.length === 0) {
    customCategoriesList.innerHTML = '<p class="empty-state">No custom categories</p>';
    return;
  }
  
  customCategoriesList.innerHTML = customCategories.map(category => `
    <div class="category-item" data-id="${category.id}">
      <div class="category-name">${category.name}</div>
      <button class="remove-category" data-id="${category.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-category').forEach(button => {
    button.addEventListener('click', () => {
      const categoryId = button.getAttribute('data-id');
      removeCustomCategory(categoryId);
    });
  });
}

// Add custom category
async function addCustomCategory() {
  const categoryName = newCategoryInput.value.trim();
  if (!categoryName) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/categories/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: categoryName })
    });
    
    if (!response.ok) throw new Error('Failed to add custom category');
    
    const newCategory = await response.json();
    customCategories.push(newCategory);
    
    // Clear input and update UI
    newCategoryInput.value = '';
    renderCustomCategories();
    
    showNotification('Custom category added', 'success');
  } catch (error) {
    console.error('Error adding custom category:', error);
    showNotification('Error adding custom category', 'error');
  }
}

// Remove custom category
async function removeCustomCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/custom/${categoryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to remove custom category');
    
    // Remove from local array and update UI
    customCategories = customCategories.filter(category => category.id !== categoryId);
    renderCustomCategories();
    
    showNotification('Custom category removed', 'success');
  } catch (error) {
    console.error('Error removing custom category:', error);
    showNotification('Error removing custom category', 'error');
  }
}

// Open folder selection modal
async function openFolderSelectionModal() {
  // Load bookmark folders
  await loadBookmarkFolders();
  
  // Initialize selected folders
  selectedFolders = [...settings.excludedFolders];
  
  // Render folder tree
  renderFolderTree();
  
  // Show modal
  folderSelectionModal.classList.add('show');
}

// Close folder selection modal
function closeFolderSelectionModal() {
  folderSelectionModal.classList.remove('show');
}

// Load bookmark folders
async function loadBookmarkFolders() {
  try {
    bookmarkFolders = await getBookmarkFolders();
  } catch (error) {
    console.error('Error loading bookmark folders:', error);
    showNotification('Error loading bookmark folders', 'error');
  }
}

// Get bookmark folders from Chrome API
function getBookmarkFolders() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      const folders = [];
      
      function traverse(node, path = '') {
        if (node.children) {
          const currentPath = path ? `${path} > ${node.title}` : node.title;
          
          // Skip the root nodes (they have no titles)
          if (node.title) {
            folders.push({
              id: node.id,
              title: node.title,
              path: currentPath
            });
          }
          
          node.children.forEach(child => traverse(child, currentPath));
        }
      }
      
      bookmarkTreeNodes.forEach(node => traverse(node));
      resolve(folders);
    });
  });
}

// Render folder tree
function renderFolderTree() {
  if (bookmarkFolders.length === 0) {
    folderTree.innerHTML = '<p class="empty-state">No bookmark folders found</p>';
    return;
  }
  
  folderTree.innerHTML = bookmarkFolders.map(folder => {
    const isSelected = selectedFolders.some(f => f.id === folder.id);
    return `
      <div class="folder-tree-item" data-id="${folder.id}">
        <label>
          <input type="checkbox" ${isSelected ? 'checked' : ''}>
          <span class="folder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </span>
          <span title="${folder.path}">${folder.title}</span>
        </label>
      </div>
    `;
  }).join('');
  
  // Add event listeners to checkboxes
  document.querySelectorAll('.folder-tree-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const folderId = checkbox.closest('.folder-tree-item').getAttribute('data-id');
      const folder = bookmarkFolders.find(f => f.id === folderId);
      
      if (checkbox.checked) {
        // Add to selected folders if not already there
        if (!selectedFolders.some(f => f.id === folderId)) {
          selectedFolders.push(folder);
        }
      } else {
        // Remove from selected folders
        selectedFolders = selectedFolders.filter(f => f.id !== folderId);
      }
    });
  });
}

// Save selected folders
function saveSelectedFolders() {
  settings.excludedFolders = [...selectedFolders];
  renderExcludedFolders();
  closeFolderSelectionModal();
  showNotification('Excluded folders updated', 'success');
}

// Export data
async function exportData() {
  try {
    // Get all data from backend
    const response = await fetch(`${API_BASE_URL}/export`);
    if (!response.ok) throw new Error('Failed to export data');
    
    const data = await response.json();
    
    // Add settings to the export data
    data.settings = settings;
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-organizer-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    showNotification('Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showNotification('Error exporting data', 'error');
  }
}

// Import data
function importData() {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  
  fileInput.addEventListener('change', async (e) => {
    if (!e.target.files.length) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format');
        }
        
        // Import data to backend
        const response = await fetch(`${API_BASE_URL}/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to import data');
        
        // Update settings if present in the import data
        if (data.settings) {
          settings = data.settings;
          await chrome.storage.sync.set({ settings });
        }
        
        // Reload data
        await loadCustomCategories();
        updateUI();
        
        showNotification('Data imported successfully', 'success');
      } catch (error) {
        console.error('Error importing data:', error);
        showNotification('Error importing data: ' + error.message, 'error');
      }
    };
    
    reader.readAsText(file);
  });
  
  // Trigger file selection
  fileInput.click();
}

// Reset data
async function resetData() {
  if (!confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
    return;
  }
  
  try {
    // Reset data in backend
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to reset data');
    
    // Reset settings to defaults
    settings = {
      autoArchiveEnabled: true,
      autoArchiveDays: 180,
      suggestionsEnabled: true,
      categoriesEnabled: true,
      tagsEnabled: true,
      excludedFolders: []
    };
    
    await chrome.storage.sync.set({ settings });
    
    // Reload data
    await loadCustomCategories();
    updateUI();
    
    showNotification('All data has been reset', 'success');
  } catch (error) {
    console.error('Error resetting data:', error);
    showNotification('Error resetting data', 'error');
  }
}

// Save settings
async function saveSettings() {
  // Update settings from UI
  settings.categoriesEnabled = categoriesEnabledToggle.checked;
  settings.tagsEnabled = tagsEnabledToggle.checked;
  settings.suggestionsEnabled = suggestionsEnabledToggle.checked;
  settings.autoArchiveEnabled = autoArchiveEnabledToggle.checked;
  settings.autoArchiveDays = parseInt(autoArchiveDaysInput.value) || 180;
  
  try {
    // Save settings to storage
    await chrome.storage.sync.set({ settings });
    
    showNotification('Settings saved successfully', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
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
