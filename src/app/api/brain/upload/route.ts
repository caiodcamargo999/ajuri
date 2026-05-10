
import { NextRequest, NextResponse } from 'next/server';
import { addDocumentToKnowledgeBase } from '@/lib/services/knowledge-base';

// Force nodejs runtime for server-side file processing
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'contract', 'lawsuit', etc.

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read file content
        // Note: For a real PDF/Docx parser we would use 'pdf-parse' or 'mammoth' here.
        // For this MVP, let's assume it's a text file or we treat it as text.
        // If it's a binary file (PDF), we would need a parsing step.
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Simple text extraction (Mock for PDF, real for .txt)
        // TODO: Integrate 'unstructured.io' or 'pdf-parse' for real PDFs
        const content = buffer.toString('utf-8');

        // Add to Vector DB (RAG)
        await addDocumentToKnowledgeBase(content, {
            filename: file.name,
            type: type || 'general',
            uploadDate: new Date().toISOString()
        });

        return NextResponse.json({ success: true, message: 'Document processed and added to Brain.' });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
    }
}
