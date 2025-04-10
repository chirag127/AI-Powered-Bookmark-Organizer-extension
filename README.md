# 📘 AI-Powered Bookmark Organizer

An intelligent browser extension that uses AI to automatically categorize, tag, and organize your bookmarks, making them easier to find and manage.

## ✨ Description

The AI-Powered Bookmark Organizer is a browser extension designed to help users manage their bookmarks efficiently. It uses artificial intelligence to automatically categorize and tag bookmarks, suggest related content, and archive unused ones, ensuring a tidy and organized collection.

This tool is ideal for:

-   Researchers who save numerous articles and resources
-   Students collecting study materials and references
-   Content creators who need to organize source materials
-   Professionals managing work-related resources
-   Anyone struggling with bookmark overload

## 🚀 Live Demo

Visit our [landing page](https://chirag127.github.io/AI-Powered-Bookmark-Organizer-extension/) to learn more about the extension.

## 🛠️ Tech Stack / Tools Used

-   **Frontend**: HTML5, CSS3, JavaScript, Manifest V3
-   **Backend**: Express.js, Node.js
-   **AI/ML**: Google's Gemini 2.0 Flash Lite
-   **APIs**: Chrome Extensions API, Gemini API
-   **Development**: Git, GitHub

## 📦 Installation Instructions

1. **Clone the Repository**

    ```bash
    git clone https://github.com/chirag127/AI-Powered-Bookmark-Organizer-extension.git
    cd AI-Powered-Bookmark-Organizer-extension
    ```

2. **Install Backend Dependencies**

    ```bash
    cd backend
    npm install
    ```

3. **Configure API Keys**

    - Create a `.env` file in the `backend` directory
    - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

4. **Load the Extension in Chrome**

    - Open Chrome and navigate to `chrome://extensions/`
    - Enable "Developer mode" in the top-right corner
    - Click "Load unpacked" and select the `extension` folder

5. **Start the Backend Server**
    ```bash
    npm start
    ```

## 🔧 Usage

1. **Add Bookmarks**: Save web pages as you normally would using your browser's bookmark feature.
2. **Automatic Organization**: The extension will automatically categorize and tag your bookmarks based on their content.
3. **View Organized Bookmarks**: Click on the extension icon to view your organized bookmarks, sorted by categories and tags.
4. **Search and Filter**: Use the search bar and filters to find specific bookmarks quickly.
5. **Customize**: Adjust categories, tags, and archiving rules in the extension settings to suit your preferences.
6. **Discover Related Content**: Explore suggested content related to your bookmarks to discover new resources.

## 🧪 Features

-   **Automatic Categorization & Tagging**: AI-powered analysis of bookmark content for accurate categorization
-   **Content Suggestion**: Recommendations for related content based on your existing bookmarks
-   **Archiving Old Bookmarks**: Automatic archiving of unused bookmarks to reduce clutter
-   **Advanced Search & Filter**: Powerful search capabilities with filtering by categories, tags, and dates
-   **Customization Options**: Personalized categories, tags, and archiving rules
-   **Cross-Browser Support**: Compatible with Chrome, Edge, and Firefox
-   **Local Storage**: Bookmark data stored locally for privacy and security
-   **Responsive UI**: Clean, intuitive interface that adapts to different screen sizes

## 🙌 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🪪 License

This project is licensed under the MIT License - see the LICENSE file for details.
