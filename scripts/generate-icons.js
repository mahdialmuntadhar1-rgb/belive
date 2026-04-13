import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    console.log('Generating PNG icons from SVG...');

    // 192x192 icon
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');

    // 512x512 icon
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');

    // 512x512 maskable icon (with safe padding)
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512-maskable.png'));
    console.log('✓ Generated icon-512-maskable.png');

    // Apple touch icon (180x180)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Favicon (32x32)
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Favicon (16x16)
    await sharp(svgPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Favicon.ico (using 32x32 as base)
    await sharp(svgPath)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
