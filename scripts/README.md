# Extension Scripts

This directory contains utility scripts for the AI-Powered Bookmark Organizer extension.

## Icon Conversion Script

The `convert-icons.js` script converts the source SVG icon to PNG files of different sizes required by the extension.

### Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the script:
   ```bash
   npm run convert-icons
   ```

This will generate the following PNG files from the source SVG:
- `extension/icons/icon16.png`
- `extension/icons/icon48.png`
- `extension/icons/icon128.png`

### Requirements

- Node.js 14+
- NPM

### Dependencies

- [sharp](https://sharp.pixelplumbing.com/) - High-performance image processing library
