
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
    const files = fs.readdirSync(inputDir).filter(file => file.startsWith('client-') && (file.endsWith('.jpg') || file.endsWith('.jpeg')));

    console.log(`Found ${files.length} images to process.`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        try {
            const image = await Jimp.read(path.join(inputDir, file));

            // 1. Greyscale
            image.greyscale();

            // 2. Contrast to separate text from background noise
            image.contrast(0.5); // Increase contrast significantly

            // 3. Pixel manipulation
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const red = this.bitmap.data[idx + 0];
                // const green = this.bitmap.data[idx + 1];
                // const blue = this.bitmap.data[idx + 2];
                // alpha at idx + 3

                // Simple luminance check
                if (red > 180) { // Lowered threshold slightly to catch dirty whites
                    this.bitmap.data[idx + 3] = 0; // Transparent
                } else {
                    // It's the logo content. Make it pure black.
                    this.bitmap.data[idx + 0] = 0;
                    this.bitmap.data[idx + 1] = 0;
                    this.bitmap.data[idx + 2] = 0;
                    this.bitmap.data[idx + 3] = 255; // Opaque
                }
            });

            // 4. Autocrop
            image.autocrop({ tolerance: 0.05 });

            // 5. Write
            const outName = file.split('.')[0] + '.png';
            await image.write(path.join(outputDir, outName));
            console.log(`Saved ${outName}`);

        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
}

processImages();
