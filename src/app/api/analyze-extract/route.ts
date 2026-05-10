import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI inside the handler to avoid build-time errors if env vars are missing
// const openai = new OpenAI({ ... });

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Image}`;

        // Prompt for the Vision API
        const prompt = `
            Você é um especialista em análise de extratos bancários para ações revisionais.
            Analise ESTE EXTRATO BANCÁRIO (imagem fornecida) e identifique TODAS as tarifas, taxas e cobranças que pareçam indevidas ou não autorizadas (ex: "Tarifa Mensalidade", "Seguro", "Capitalização", "RMC", "Pacote de Serviços").
            
            Retorne APENAS um JSON estrito com a lista de itens encontrados, seguindo este formato:
            {
                "charges": [
                    {
                        "date": "YYYY-MM-DD",
                        "description": "Descrição exata que aparece no extrato",
                        "value": 0.00 (número float, positivo)
                    }
                ]
            }
            
            Se não encontrar nada, retorne { "charges": [] }.
            Ignore entradas de crédito, saldos ou transferências normais (PIX enviado/recebido), focado apenas em TARIFAS do banco.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Using gpt-4o which has vision capabilities
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const result = JSON.parse(content);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing extract:', error);
        return NextResponse.json(
            { error: 'Failed to process extract', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
