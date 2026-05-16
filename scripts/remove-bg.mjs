import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../public/logo.png');
const tempPath = path.join(__dirname, '../public/logo-nobg.png');

// Read image as raw RGBA pixels
const image = sharp(inputPath);
const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

console.log(`Image: ${width}x${height}, channels: ${channels}`);

// Count modified pixels for feedback
let modified = 0;

for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Remove white and near-white pixels (background)
    // Threshold 220 catches anti-aliased edges too
    if (r >= 220 && g >= 220 && b >= 220) {
        data[i + 3] = 0; // fully transparent
        modified++;
    }
}

console.log(`Modified ${modified} pixels out of ${width * height}`);

// Write to temp file first
await sharp(Buffer.from(data), {
    raw: { width, height, channels }
})
    .png()
    .toFile(tempPath);

// Replace original
fs.unlinkSync(inputPath);
fs.renameSync(tempPath, inputPath);

console.log('✅ Done! logo.png now has no white background.');
