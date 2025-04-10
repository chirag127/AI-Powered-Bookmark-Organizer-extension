const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Define icon sizes
const sizes = [16, 48, 128];

// Source SVG file
const svgPath = path.join(__dirname, '../extension/icons/icon.svg');

// Function to convert SVG to PNG
async function convertToPng(size) {
  const outputPath = path.join(__dirname, `../extension/icons/icon${size}.png`);
  
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created icon${size}.png`);
  } catch (error) {
    console.error(`❌ Error creating icon${size}.png:`, error);
  }
}

// Check if SVG file exists
if (!fs.existsSync(svgPath)) {
  console.error(`❌ Source SVG file not found at ${svgPath}`);
  process.exit(1);
}

// Convert SVG to all sizes
async function convertAllSizes() {
  console.log('🔄 Converting SVG to PNG icons...');
  
  try {
    // Process all sizes in parallel
    await Promise.all(sizes.map(size => convertToPng(size)));
    console.log('✨ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run the conversion
convertAllSizes();
