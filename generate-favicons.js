#!/usr/bin/env node

/**
 * Generate all required favicon sizes from the source logo
 * Run with: node generate-favicons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_IMAGE = './dist/favicon.png';
const OUTPUT_DIR = './public';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define all required favicon sizes
const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon.png', size: 32 }, // Default favicon
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'mstile-150x150.png', size: 150 },
];

async function generateFavicons() {
    console.log('🎨 Generating favicons from:', SOURCE_IMAGE);
    console.log('📁 Output directory:', OUTPUT_DIR);
    console.log('');

    try {
        // Check if source image exists
        if (!fs.existsSync(SOURCE_IMAGE)) {
            console.error('❌ Source image not found:', SOURCE_IMAGE);
            process.exit(1);
        }

        // Generate each size
        for (const { name, size } of sizes) {
            const outputPath = path.join(OUTPUT_DIR, name);

            await sharp(SOURCE_IMAGE)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                })
                .png()
                .toFile(outputPath);

            console.log(`✅ Generated: ${name} (${size}×${size}px)`);
        }

        // Generate favicon.ico (multi-size ICO file)
        // Note: Sharp doesn't support ICO format directly, so we'll create a note
        console.log('');
        console.log('⚠️  Note: favicon.ico needs to be generated separately.');
        console.log('   Visit https://favicon.io/favicon-converter/ to convert favicon-32x32.png to .ico');
        console.log('');
        console.log('🎉 All PNG favicons generated successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. Copy all generated files from public/ to your server root');
        console.log('   2. Generate favicon.ico using the converter link above');
        console.log('   3. Update your HTML <head> with the favicon links');
        console.log('   4. Deploy and test!');

    } catch (error) {
        console.error('❌ Error generating favicons:', error.message);
        process.exit(1);
    }
}

generateFavicons();
