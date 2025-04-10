document.addEventListener('DOMContentLoaded', function() {
  // Load saved options
  loadOptions();
  
  // Save button
  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveOptions);
  
  // Add category button
  const addCategoryButton = document.getElementById('add-category-button');
  addCategoryButton.addEventListener('click', addCategory);
  
  // Delete category buttons
  setupDeleteButtons();
  
  // Export data button
  const exportDataButton = document.getElementById('export-data');
  exportDataButton.addEventListener('click', exportData);
  
  // Import data button
  const importDataButton = document.getElementById('import-data');
  importDataButton.addEventListener('click', importData);
  
  // Reset data button
  const resetDataButton = document.getElementById('reset-data');
  resetDataButton.addEventListener('click', resetData);
});

// Function to load saved options
function loadOptions() {
  // This is a placeholder function
  // In a real implementation, this would load options from chrome.storage
  chrome.storage.sync.get({
    autoCategorize: true,
    suggestContent: true,
    archiveBookmarks: true,
    archiveThreshold: '90',
    excludeFolders: ['important'],
    categories: ['Technology', 'Science', 'News', 'Entertainment', 'Education']
  }, function(items) {
    document.getElementById('auto-categorize').checked = items.autoCategorize;
    document.getElementById('suggest-content').checked = items.suggestContent;
    document.getElementById('archive-bookmarks').checked = items.archiveBookmarks;
    document.getElementById('archive-threshold').value = items.archiveThreshold;
    
    // Set excluded folders
    const excludeFoldersSelect = document.getElementById('exclude-folders');
    for (let i = 0; i < excludeFoldersSelect.options.length; i++) {
      excludeFoldersSelect.options[i].selected = items.excludeFolders.includes(excludeFoldersSelect.options[i].value);
    }
    
    // Load categories
    loadCategories(items.categories);
  });
}

// Function to save options
function saveOptions() {
  const autoCategorize = document.getElementById('auto-categorize').checked;
  const suggestContent = document.getElementById('suggest-content').checked;
  const archiveBookmarks = document.getElementById('archive-bookmarks').checked;
  const archiveThreshold = document.getElementById('archive-threshold').value;
  
  // Get selected exclude folders
  const excludeFoldersSelect = document.getElementById('exclude-folders');
  const excludeFolders = Array.from(excludeFoldersSelect.selectedOptions).map(option => option.value);
  
  // Get categories
  const categoryItems = document.querySelectorAll('.category-item span');
  const categories = Array.from(categoryItems).map(item => item.textContent);
  
  // Save to chrome.storage
  chrome.storage.sync.set({
    autoCategorize: autoCategorize,
    suggestContent: suggestContent,
    archiveBookmarks: archiveBookmarks,
    archiveThreshold: archiveThreshold,
    excludeFolders: excludeFolders,
    categories: categories
  }, function() {
    // Show status message
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = 'Options saved!';
    
    // Clear status message after 2 seconds
    setTimeout(function() {
      statusMessage.textContent = '';
    }, 2000);
  });
}

// Function to load categories
function loadCategories(categories) {
  const categoryList = document.querySelector('.category-list');
  categoryList.innerHTML = '';
  
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <span>${category}</span>
      <button class="delete-button">Delete</button>
    `;
    categoryList.appendChild(categoryItem);
  });
  
  // Setup delete buttons for new items
  setupDeleteButtons();
}

// Function to add a new category
function addCategory() {
  const newCategoryInput = document.getElementById('new-category');
  const categoryName = newCategoryInput.value.trim();
  
  if (categoryName) {
    const categoryList = document.querySelector('.category-list');
    
    // Check if category already exists
    const existingCategories = Array.from(categoryList.querySelectorAll('span')).map(span => span.textContent);
    if (existingCategories.includes(categoryName)) {
      alert('This category already exists!');
      return;
    }
    
    // Create new category item
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <span>${categoryName}</span>
      <button class="delete-button">Delete</button>
    `;
    categoryList.appendChild(categoryItem);
    
    // Clear input
    newCategoryInput.value = '';
    
    // Setup delete button for new item
    setupDeleteButtons();
  }
}

// Function to setup delete buttons
function setupDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const categoryItem = this.parentElement;
      categoryItem.remove();
    });
  });
}

// Function to export data
function exportData() {
  // This is a placeholder function
  // In a real implementation, this would export bookmark data
  chrome.storage.sync.get(null, function(items) {
    // Convert data to JSON
    const jsonData = JSON.stringify(items, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    // Create and click a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmark-organizer-data.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Function to import data
function importData() {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          
          // Save imported data
          chrome.storage.sync.set(data, function() {
            // Reload options
            loadOptions();
            
            // Show status message
            const statusMessage = document.getElementById('status-message');
            statusMessage.textContent = 'Data imported successfully!';
            
            // Clear status message after 2 seconds
            setTimeout(function() {
              statusMessage.textContent = '';
            }, 2000);
          });
        } catch (error) {
          alert('Error importing data: ' + error.message);
        }
      };
      
      reader.readAsText(file);
    }
  });
  
  // Trigger file selection
  fileInput.click();
}

// Function to reset data
function resetData() {
  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
    chrome.storage.sync.clear(function() {
      // Reload options with defaults
      loadOptions();
      
      // Show status message
      const statusMessage = document.getElementById('status-message');
      statusMessage.textContent = 'All data has been reset!';
      
      // Clear status message after 2 seconds
      setTimeout(function() {
        statusMessage.textContent = '';
      }, 2000);
    });
  }
}
