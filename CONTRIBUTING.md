# Contributing to AI-Powered Bookmark Organizer

Thank you for your interest in contributing to the AI-Powered Bookmark Organizer! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate in all interactions.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser information (name, version)
- Any additional context

### Suggesting Enhancements

We welcome suggestions for enhancements! Please create an issue with:

- A clear, descriptive title
- A detailed description of the proposed enhancement
- Any relevant examples or mockups
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Pull Request Guidelines

- Follow the coding style and conventions used in the project
- Include tests for new features or bug fixes
- Update documentation as needed
- Ensure all tests pass
- Keep pull requests focused on a single change
- Link to any relevant issues

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/chirag127/AI-Powered-Bookmark-Organizer-extension.git
   cd AI-Powered-Bookmark-Organizer-extension
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Configure API keys
   - Create a `.env` file in the `backend` directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

4. Load the extension in your browser for testing

## Project Structure

- `extension/`: Frontend code for the browser extension
  - `manifest.json`: Extension configuration
  - `popup/`: UI for the extension popup
  - `background/`: Background scripts
  - `content/`: Content scripts
  - `options/`: Options page
- `backend/`: Server-side code
  - `server.js`: Express.js server
  - `routes/`: API routes
  - `controllers/`: Request handlers
  - `services/`: Business logic
- `docs/`: Documentation and GitHub Pages website

## Coding Guidelines

- Use meaningful variable and function names
- Write comments for complex logic
- Follow the existing code style
- Keep functions small and focused
- Write unit tests for new functionality

## Documentation

Please update documentation when making changes:

- Update README.md for significant changes
- Update inline code comments
- Update the GitHub Pages website if relevant

## Questions?

If you have any questions about contributing, please open an issue labeled "question" on GitHub.

Thank you for contributing to the AI-Powered Bookmark Organizer!
