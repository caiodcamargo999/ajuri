
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public/cases/processed');

async function extractText() {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));
    console.log(`Found ${files.length} images to OCR...`);

    // Create worker
    const worker = await createWorker('eng'); // Using English as default, though names are Portuguese (Latin script same)

    const results = [];

    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        console.log(`Processing ${file}...`);

        const { data: { text } } = await worker.recognize(fullPath);

        // Clean text
        const cleanText = text.replace(/\n/g, ' ').replace(/[^a-zA-ZÀ-ÿ0-9 &]/g, '').trim();

        console.log(`Extracted: "${cleanText}"`);

        results.push({
            file,
            text: cleanText
        });
    }

    await worker.terminate();

    // Save mapping
    fs.writeFileSync(path.join(__dirname, 'ocr_results.json'), JSON.stringify(results, null, 2));
}

extractText();
