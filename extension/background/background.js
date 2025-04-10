// API endpoint
const API_BASE_URL = "http://localhost:3000/api";

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log("AI-Powered Bookmark Organizer installed");

    // Initialize storage with default settings
    const defaultSettings = {
        autoArchiveEnabled: true,
        autoArchiveDays: 180, // 6 months
        suggestionsEnabled: true,
        categoriesEnabled: true,
        tagsEnabled: true,
        excludedFolders: [],
    };

    await chrome.storage.sync.set({ settings: defaultSettings });

    // Send existing bookmarks for categorization
    try {
        const bookmarks = await getAllBookmarks();
        await categorizeBookmarks(bookmarks);
    } catch (error) {
        console.error("Error categorizing existing bookmarks:", error);
    }
});

// Listen for bookmark changes
chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
    console.log("Bookmark created:", bookmark);

    try {
        // Send new bookmark for categorization
        await categorizeBookmarks([
            {
                id,
                title: bookmark.title,
                url: bookmark.url,
                dateAdded: Date.now(),
            },
        ]);
    } catch (error) {
        console.error("Error categorizing new bookmark:", error);
    }
});

chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => {
    console.log("Bookmark changed:", id, changeInfo);

    try {
        // Update the bookmark in the backend
        await updateBookmark(id, {
            title: changeInfo.title,
            url: changeInfo.url,
        });
    } catch (error) {
        console.error("Error updating bookmark:", error);
    }
});

chrome.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
    console.log("Bookmark removed:", id, removeInfo);

    try {
        // Delete the bookmark from the backend
        await deleteBookmark(id);
    } catch (error) {
        console.error("Error deleting bookmark from backend:", error);
    }
});

// Get all bookmarks
async function getAllBookmarks() {
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
                dateAdded: node.dateAdded,
            });
        }

        if (node.children) {
            node.children.forEach(traverse);
        }
    }

    bookmarkTreeNodes.forEach(traverse);
    return bookmarks;
}

// Send bookmarks to backend for categorization
async function categorizeBookmarks(bookmarks) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookmarks/categorize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookmarks }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Failed to categorize bookmarks"
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error categorizing bookmarks:", error);
        throw error;
    }
}

// Update a bookmark in the backend
async function updateBookmark(id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update bookmark");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating bookmark:", error);
        throw error;
    }
}

// Delete a bookmark from the backend
async function deleteBookmark(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete bookmark");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        throw error;
    }
}

// Check for bookmarks to archive (runs daily)
async function checkBookmarksForArchiving() {
    try {
        // Get settings
        const { settings } = await chrome.storage.sync.get("settings");

        // If auto-archive is disabled, skip
        if (!settings.autoArchiveEnabled) return;

        // Get the threshold date
        const thresholdDate =
            Date.now() - settings.autoArchiveDays * 24 * 60 * 60 * 1000;

        // Get all bookmarks
        const bookmarks = await getAllBookmarks();

        // Find bookmarks older than the threshold
        const bookmarksToArchive = bookmarks.filter(
            (bookmark) =>
                bookmark.dateAdded < thresholdDate &&
                !isInExcludedFolder(bookmark.id, settings.excludedFolders)
        );

        if (bookmarksToArchive.length === 0) return;

        // Archive bookmarks
        await archiveBookmarks(bookmarksToArchive.map((b) => b.id));

        // Show notification
        chrome.notifications.create("archive-notification", {
            type: "basic",
            iconUrl: "../icons/icon128.png",
            title: "Bookmarks Archived",
            message: `${bookmarksToArchive.length} bookmarks have been archived due to inactivity.`,
        });
    } catch (error) {
        console.error("Error checking bookmarks for archiving:", error);
    }
}

// Check if a bookmark is in an excluded folder
function isInExcludedFolder(/* bookmarkId, excludedFolders */) {
    // This is a simplified check. In a real implementation, you would need to
    // traverse the bookmark tree to find the parent folders of the bookmark.
    return false;
}

// Archive bookmarks
async function archiveBookmarks(bookmarkIds) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/bookmarks/archive-batch`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookmarkIds }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to archive bookmarks");
        }

        return await response.json();
    } catch (error) {
        console.error("Error archiving bookmarks:", error);
        throw error;
    }
}

// Set up alarm for daily archiving check
chrome.alarms.create("checkBookmarksForArchiving", {
    periodInMinutes: 24 * 60, // Once a day
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkBookmarksForArchiving") {
        checkBookmarksForArchiving();
    }
});

// Listen for messages from the test page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === "check-extension-status") {
        sendResponse({ status: "ok" });
        return true; // Keep the message channel open for the async response
    }
});
