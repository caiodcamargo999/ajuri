
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public/cases');
const outputDir = path.join(__dirname, 'public/cases/processed');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImages() {
    // Only process original source files (jpg/jpeg/png in inputDir), not the processed ones if they accidentally got there
    const files = fs.readdirSync(inputDir).filter(file => (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')));

    console.log(`Found ${files.length} images to process in ${inputDir}`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        try {
            const image = await Jimp.read(path.join(inputDir, file));

            // The goal: Dark text on White BG -> White Text on Transparent BG

            // 1. Convert to Greyscale to ensure we just deal with intensity
            image.greyscale();

            // 2. Increase contrast effectively to sharpen edges
            image.contrast(0.4);

            // 3. Scan every pixel
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                // a = idx + 3

                // Calculate luminance (since it's greyscale, r=g=b)
                let luma = r;

                // 4. "Clean" the background
                // Anything reasonably bright should be treated as pure background
                if (luma > 200) {
                    luma = 255;
                }

                // 5. Calculate Alpha based on inversion of Luminance
                // White (255) -> 0 Alpha (Transparent)
                // Black (0) -> 255 Alpha (Solid)
                let alpha = 255 - luma;

                // 6. Text Enhancement / Binarization
                // If it's not fully transparent, boost it to make it readable.
                // We want faint gray text to become solid white text.
                if (alpha > 10) {
                    // Boost alpha. e.g., if it was gray (100), it becomes fully opaque (255)
                    // This effectively eliminates "grayness" inside the letters, making them solid white.
                    alpha = Math.min(255, alpha * 20);
                } else {
                    // Force noise to 0
                    alpha = 0;
                }

                // 7. Write the pixel as PURE WHITE with the calculated Alpha
                this.bitmap.data[idx + 0] = 255; // R
                this.bitmap.data[idx + 1] = 255; // G
                this.bitmap.data[idx + 2] = 255; // B
                this.bitmap.data[idx + 3] = alpha; // A
            });

            // 8. Autocrop to remove the now-transparent margins
            image.autocrop({ tolerance: 0.01 });

            // 9. Resize if too massive (optional, but good for performance)
            if (image.bitmap.width > 800) {
                image.resize({ w: 800 });
            }

            // 10. Write as PNG
            const outName = file.split('.')[0] + '.png';
            await image.write(path.join(outputDir, outName));
            console.log(`Saved clean white logo: ${outName}`);

        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
}

processImages();
