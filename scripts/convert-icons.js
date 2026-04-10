import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertSVGToPNG = async (svgFile, pngFile, size) => {
  try {
    const svgPath = path.join(__dirname, '../public', svgFile);
    const pngPath = path.join(__dirname, '../public', pngFile);
    
    await sharp(svgPath)
      .resize(size, size)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(pngPath);
    
    console.log(`Successfully converted ${svgFile} to ${pngFile} (${size}x${size})`);
  } catch (error) {
    console.error(`Error converting ${svgFile}:`, error);
  }
};

// Convert all SVG icons to PNG
const convertAllIcons = async () => {
  console.log('Converting SVG icons to PNG...');
  
  await convertSVGToPNG('icon-192.svg', 'icon-192.png', 192);
  await convertSVGToPNG('icon-512.svg', 'icon-512.png', 512);
  await convertSVGToPNG('icon-maskable-512.svg', 'icon-maskable-512.png', 512);
  
  // Create apple-touch-icon (180x180)
  const appleIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <rect width="180" height="180" rx="40" fill="#00BFA5"/>
    <text x="90" y="90" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="108" fill="white" font-weight="bold">S</text>
  </svg>`;
  
  try {
    await sharp(Buffer.from(appleIconSVG))
      .resize(180, 180)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log('Successfully created apple-touch-icon.png (180x180)');
  } catch (error) {
    console.error('Error creating apple-touch-icon.png:', error);
  }
  
  // Create favicon.ico (32x32)
  const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="#00BFA5"/>
    <text x="16" y="16" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="white" font-weight="bold">S</text>
  </svg>`;
  
  try {
    await sharp(Buffer.from(faviconSVG))
      .resize(32, 32)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(__dirname, '../public/favicon.png'));
    
    // For favicon.ico, we'll create a simple ICO file
    // In production, you might want to use a specialized ICO generator
    console.log('Successfully created favicon.png (32x32)');
    console.log('Note: favicon.ico should be generated using a specialized tool for best compatibility');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
  
  console.log('\nIcon conversion complete!');
};

convertAllIcons().catch(console.error);
