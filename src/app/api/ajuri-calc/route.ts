import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── helper: try to extract text from the PDF buffer ─────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
    let parser: any = null;
    try {
        // Use dynamic import with webpackIgnore to prevent webpack from bundling pdf-parse
        const { PDFParse } = await import(/* webpackIgnore: true */ 'pdf-parse');
        parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
        const result = await parser.getText();
        return result.text || '';
    } catch (err: any) {
        console.error('[ajuri-calc] pdf-parse failed, will fall back to vision. Error stack:', err?.stack || err);
        return '';
    } finally {
        if (parser) {
            try {
                await parser.destroy();
            } catch (destroyErr) {
                console.warn('[ajuri-calc] failed to destroy pdf-parse parser:', destroyErr);
            }
        }
    }
}

// ── helper: filter noise lines ───────────────────────────────────────────
function isNoiseLine(line: string): boolean {
    const normalized = line.trim();
    if (!normalized) return true;
    if (normalized.includes('Bradesco Celular')) return true;
    if (normalized.startsWith('Data:')) return true;
    if (normalized.includes('Nome:')) return true;
    if (normalized.includes('Extrato de:')) return true;
    if (normalized.includes('Data Histórico')) return true;
    if (normalized.match(/-- \d+ of \d+ --/)) return true;
    return false;
}

// ── helper: classify action based on official model ──────────────────────
function classifyAction(description: string, aiAction?: string): string {
    if (aiAction && aiAction.trim().length > 1) {
        const cleaned = aiAction.toUpperCase().trim();
        if (cleaned !== "OUTRO" && cleaned !== "DESCONHECIDO") {
            return cleaned;
        }
    }
    const d = description.toUpperCase();
    if (d.includes('SEGURO') || d.includes('SEG.') || d.includes('SEG ') || d.includes('PRESTAMISTA') || d.includes('ASPECIR') || d.includes('CHUBB') || d.includes('PREVISUL') || d.includes('VIDA E PREV') || d.includes('SUPERPROTEGIDO')) {
        return 'SEGURO';
    }
    if (d.includes('ANUIDADE') || d.includes('ANUID')) {
        return 'ANUIDADE';
    }
    if (d.includes('PARC') || d.includes('PARCELA') || d.includes('PARCELAMENTO')) {
        return 'PARCELA CRED';
    }
    if (d.includes('MORA') || d.includes('MULTA')) {
        return 'MORA';
    }
    if (d.includes('CESTA') || d.includes('COMBINAQUI') || d.includes('PADRONIZADO') || d.includes('MAXIC')) {
        return 'CESTA';
    }
    if (d.includes('JUROS') || d.includes('IOF')) {
        return 'JUROS ABUSIVOS';
    }
    if (d.includes('RMC')) {
        return 'RMC';
    }
    if (d.includes('RCC')) {
        return 'RCC';
    }
    if (d.includes('AVERBA') || d.includes('AVERB')) {
        return 'AVERBAÇÃO';
    }
    if (d.includes('APLIC') || d.includes('INVEST')) {
        return 'APLIC';
    }
    if (d.includes('ENCARGO') || d.includes('EMCARGO')) {
        return 'ENCARGOS';
    }
    if (d.includes('GASTO') || d.includes('COMPRA') || (d.includes('CARTAO') && !d.includes('ANUIDADE'))) {
        return 'GASTOS CARTÃO DE CRÉDITO';
    }
    if (d.includes('PACOTE') || d.includes('SERV BANC')) {
        return 'PACOTE DE SERVIÇOS';
    }
    if (d.includes('BX')) {
        return 'BX';
    }
    if (d.includes('CAP') || d.includes('CAPITALIZA')) {
        return 'TITULO DE CAPITALIZAÇÃO';
    }
    if (d.includes('FATURA PROTEGIDA')) {
        return 'FATURA PROTEGIDA';
    }
    if (d.includes('CADASTRO') || d.includes('CONFECÇÃO')) {
        return 'TARIFA DE CADASTRO';
    }
    if (d.includes('AVALIA') || d.includes('AVAL')) {
        return 'TARIFA DE AVALIAÇÃO';
    }
    if (d.includes('REGISTRO')) {
        return 'REGISTRO DE CONTRATO';
    }
    if (d.includes('ADIANT') || d.includes('ADEP')) {
        return 'ADIANT DEPOSITANTE';
    }
    if (d.includes('SAQUE')) {
        return 'SAQUE TERMINAL';
    }
    if (d.includes('SMS')) {
        return 'FACILIDADE SMS PLUS';
    }
    if (d.includes('GOLPE') || d.includes('PIX FRAUD')) {
        return 'GOLPE DO PIX';
    }
    if (d.includes('BLOQUEIO')) {
        return 'BLOQUEIO INDEVIDO';
    }
    if (d.includes('TARIFA') || d.includes('TAR ')) {
        return 'TARIFA INDEVIDA';
    }
    return 'COBRANÇA INDEVIDA';
}

// ── helper: build the GPT prompt ────────────────────────────────────────
function buildPrompt(keywords: string[], dateLayout: string, clientName: string, bankName: string, period: string, hasPreprocessedDates: boolean) {
    const keywordList = keywords.map((k) => `"${k}"`).join(', ');
    const dateLayoutDesc = dateLayout === 'header'
        ? 'a data aparece como cabeçalho de seção (linha separada acima das transações do dia)'
        : 'a data aparece na mesma linha que a descrição da transação';

    const actionCategories = "SEGURO, ANUIDADE, PARCELA CRED, MORA, CESTA, JUROS ABUSIVOS, RMC, RCC, AVERBAÇÃO, APLIC, ENCARGOS, GASTOS CARTÃO DE CRÉDITO, PACOTE DE SERVIÇOS, BX, TITULO DE CAPITALIZAÇÃO, FATURA PROTEGIDA, TARIFA DE CADASTRO, REGISTRO DE CONTRATO, TARIFA DE AVALIAÇÃO, ADIANT DEPOSITANTE, SAQUE TERMINAL, FACILIDADE SMS PLUS, COBRANÇA INDEVIDA";

    let system = '';
    if (hasPreprocessedDates) {
        system = `Você é um especialista em análise de extratos bancários para ações revisionais de contratos bancários.
Sua tarefa é identificar APENAS os débitos cujas descrições contenham (parcial ou totalmente, sem diferenciar maiúsculas/minúsculas) as palavras-chave fornecidas.

REGRAS:
1. Analise TODAS as transações do extrato.
2. Identifique SOMENTE débitos (saídas de dinheiro) que correspondam às palavras-chave.
3. EXCLUA estritamente qualquer transação de CRÉDITO (entrada de dinheiro, rendimentos, depósitos recebidos, recebimentos de TED/DOC de outros bancos), mesmo que contenha alguma palavra-chave (ex: "RENDIMENTOS", "RECEBIMENTO", "REMETENTE" são créditos/entradas e devem ser ignorados).
4. EXCLUA pagamentos de boletos de consumo pessoal (lojas de varejo como Renner, Riachuelo, C&A, contas de consumo pessoal como água, luz, telefone, internet, e transferências voluntárias realizadas para outras pessoas físicas), pois não são tarifas ou cobranças indevidas do banco.
5. Cada linha do extrato filtrado está prefixada com "[DATA: DD/MM/YYYY]" para indicar a data correspondente à transação daquela linha. Utilize esta data para preencher o campo "date" no JSON. Remova este prefixo "[DATA: ...]" do campo "description".
6. Se a transação estiver dividida em múltiplas linhas consecutivas sob a mesma data, junte as descrições em um único texto contínuo e extraia o valor correto da linha correspondente.
7. Para cada transação, classifique o campo "action" em uma das categorias de ações jurídicas: ${actionCategories}.
8. Extraia: data (da marcação [DATA: ...]), descrição exata (sem o prefixo [DATA: ...]), valor positivo (converta negativo em positivo) e a categoria da ação no campo "action".
9. Retorne SOMENTE JSON puro, sem markdown, sem explicações.${clientName ? `\nCliente: ${clientName}` : ''}${bankName ? `\nBanco: ${bankName}` : ''}${period ? `\nPeríodo: ${period}` : ''}`;
    } else {
        system = `Você é um especialista em análise de extratos bancários para ações revisionais de contratos bancários.
Sua tarefa é identificar APENAS os débitos cujas descrições contenham (parcial ou totalmente, sem diferenciar maiúsculas/minúsculas) as palavras-chave fornecidas.

REGRAS:
1. Analise TODAS as transações do extrato.
2. Identifique SOMENTE débitos (saídas de dinheiro) que correspondam às palavras-chave.
3. EXCLUA estritamente qualquer transação de CRÉDITO (entrada de dinheiro, rendimentos, depósitos recebidos, recebimentos de TED/DOC de outros bancos), mesmo que contenha alguma palavra-chave (ex: "RENDIMENTOS", "RECEBIMENTO", "REMETENTE" são créditos/entradas e devem ser ignorados).
4. EXCLUA pagamentos de boletos de consumo pessoal (lojas de varejo como Renner, Riachuelo, C&A, contas de consumo pessoal como água, luz, telefone, internet, e transferências voluntárias realizadas para outras pessoas físicas), pois não são tarifas ou cobranças indevidas do banco.
5. Layout do extrato: ${dateLayoutDesc}.
6. Para cada transação, classifique o campo "action" em uma das categorias de ações jurídicas: ${actionCategories}.
7. Extraia: data (exatamente como aparece), descrição exata, valor positivo (converta negativo em positivo) e a categoria da ação no campo "action".
8. Retorne SOMENTE JSON puro, sem markdown, sem explicações.${clientName ? `\nCliente: ${clientName}` : ''}${bankName ? `\nBanco: ${bankName}` : ''}${period ? `\nPeríodo: ${period}` : ''}`;
    }

    const userJson = `Palavras-chave: ${keywordList}

Retorne EXATAMENTE este JSON (sem markdown):
{
  "transactions": [
    { "date": "data exata", "description": "descrição exata", "value": 0.00, "action": "SEGURO" }
  ]
}

Se nenhuma transação for encontrada: { "transactions": [] }`;

    return { system, keywordList, userJson };
}

// ── main handler ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

        // Parse multipart form data
        const formData = await request.formData();
        const pdfFile = formData.get('pdf') as File | null;
        const keywordsRaw = formData.get('keywords') as string;
        const dateLayout = (formData.get('dateLayout') as string) || 'inline';
        const clientName = (formData.get('clientName') as string) || '';
        const bankName = (formData.get('bankName') as string) || '';
        const period = (formData.get('period') as string) || '';

        if (!pdfFile) {
            return NextResponse.json({ error: 'Nenhum arquivo PDF fornecido.' }, { status: 400 });
        }

        let keywords: string[] = [];
        try {
            keywords = JSON.parse(keywordsRaw);
        } catch {
            return NextResponse.json({ error: 'Lista de palavras-chave inválida.' }, { status: 400 });
        }

        if (!keywords || keywords.length === 0) {
            return NextResponse.json({ error: 'Nenhuma palavra-chave fornecida.' }, { status: 400 });
        }

        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

        // ── Mode A: text-based extraction ────────────────────────────────
        const pdfText = await extractPdfText(pdfBuffer);
        const hasText = pdfText.trim().length >= 100;

        const { system, keywordList, userJson } = buildPrompt(keywords, dateLayout, clientName, bankName, period, hasText);

        let aiResponse: string | null = null;

        if (hasText) {
            console.log(`[ajuri-calc] Text mode: ${pdfText.length} chars extracted`);

            const lines = pdfText.split(/\r?\n/);
            const keywordRegexes = keywords.map(kw => new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
            const lineDateRegex = /^\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{2})\b/;

            let currentDate = '';
            const filteredLines: string[] = [];
            const includedIndices = new Set<number>();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check if line starts with a date and update currentDate
                const dateMatch = line.match(lineDateRegex);
                if (dateMatch) {
                    currentDate = dateMatch[1];
                }

                if (isNoiseLine(line)) {
                    continue;
                }

                const isMatch = keywordRegexes.some(regex => regex.test(line));
                if (isMatch) {
                    const datePrefix = currentDate ? `[DATA: ${currentDate}] ` : '[DATA: DESCONHECIDA] ';

                    if (!includedIndices.has(i)) {
                        filteredLines.push(`${datePrefix}${line.trim()}`);
                        includedIndices.add(i);
                    }

                    // Check up to 1 subsequent line for multi-line transactions continuation (which is typically sufficient to get amounts)
                    for (let offset = 1; offset <= 1; offset++) {
                        const nextIdx = i + offset;
                        if (nextIdx >= lines.length) break;

                        const nextLine = lines[nextIdx];
                        if (nextLine.match(lineDateRegex)) break;
                        if (isNoiseLine(nextLine)) break;

                        if (!includedIndices.has(nextIdx)) {
                            filteredLines.push(`${datePrefix}${nextLine.trim()}`);
                            includedIndices.add(nextIdx);
                        }
                    }
                }
            }

            // If no matching lines are found, return empty results immediately without calling OpenAI!
            if (filteredLines.length === 0) {
                console.log(`[ajuri-calc] No matching lines found for keywords. Returning empty response.`);
                return NextResponse.json({ transactions: [], totalDebits: 0 });
            }

            // Split filteredLines into chunks of 50 lines to prevent OpenAI from hitting output token limits (max 4096 tokens)
            const CHUNK_SIZE = 50;
            const chunks: string[][] = [];
            for (let i = 0; i < filteredLines.length; i += CHUNK_SIZE) {
                chunks.push(filteredLines.slice(i, i + CHUNK_SIZE));
            }
            console.log(`[ajuri-calc] Split matching lines into ${chunks.length} chunks.`);

            const promises = chunks.map(async (chunk, index) => {
                const chunkText = chunk.join('\n');
                console.log(`[ajuri-calc] Sending chunk ${index + 1}/${chunks.length} (${chunk.length} lines) to OpenAI...`);
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: system },
                        {
                            role: 'user', content: `${userJson}\n\nTexto do extrato bancário (linhas filtradas com prefixo de data, parte ${index + 1} de ${chunks.length}):\n---\n${chunkText}\n---`
                        },
                    ],
                    response_format: { type: 'json_object' },
                    max_tokens: 4096,
                    temperature: 0,
                });
                return completion.choices[0]?.message?.content ?? null;
            });

            const chunkResponses = await Promise.all(promises);

            const allTransactions: any[] = [];
            for (let idx = 0; idx < chunkResponses.length; idx++) {
                const responseContent = chunkResponses[idx];
                if (!responseContent) continue;
                try {
                    const parsed = JSON.parse(responseContent);
                    const txs = parsed.transactions || [];
                    allTransactions.push(...txs);
                } catch (err: any) {
                    console.error(`[ajuri-calc] Failed to parse chunk ${idx + 1} JSON:`, err?.message);
                    // Regex fallback parser for the chunk response in case of syntax anomaly
                    const regex = /\{\s*"date"\s*:\s*"([^"]*)"\s*,\s*"description"\s*:\s*"([^"]*)"\s*,\s*"value"\s*:\s*([0-9.]+)(?:,\s*"action"\s*:\s*"([^"]*)")?\s*\}/gi;
                    let match;
                    while ((match = regex.exec(responseContent)) !== null) {
                        allTransactions.push({ 
                            date: match[1], 
                            description: match[2], 
                            value: parseFloat(match[3]),
                            action: match[4] || undefined,
                        });
                    }
                }
            }

            // Create a fake aiResponse JSON structure containing the merged transactions array
            aiResponse = JSON.stringify({ transactions: allTransactions });

        } else {
            // ── Mode B: vision fallback (scanned/image PDF) ───────────────
            console.log('[ajuri-calc] Vision mode: no extractable text found, sending PDF as base64 image');

            // Send PDF as base64 data URL directly to GPT-4o vision
            const pdfBase64 = pdfBuffer.toString('base64');

            // GPT-4o accepts PDF as a file input via the 'file' url scheme
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: system },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `${userJson}\n\nAnalise as páginas do extrato bancário no PDF abaixo e identifique os débitos com as palavras-chave: ${keywordList}`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:application/pdf;base64,${pdfBase64}`,
                                    detail: 'high',
                                },
                            } as any,
                        ],
                    },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 4096,
                temperature: 0,
            });

            aiResponse = completion.choices[0]?.message?.content ?? null;
        }

        if (!aiResponse) {
            throw new Error('Resposta vazia do modelo de IA.');
        }

        // Parse and normalize the result
        let result: { transactions: any[]; totalDebits: number };
        try {
            result = JSON.parse(aiResponse);
        } catch {
            // Try to extract JSON from the response
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('Formato de resposta inválido da IA.');
            result = JSON.parse(match[0]);
        }

        const transactions = (result.transactions || []).map((t: any) => {
            const desc = String(t.description || '').trim();
            return {
                date: String(t.date || '').trim(),
                description: desc,
                value: Math.abs(parseFloat(String(t.value).replace(',', '.')) || 0),
                action: classifyAction(desc, t.action),
            };
        }).filter((t: any) => t.value > 0);

        const totalDebits = Math.round(
            transactions.reduce((sum: number, t: any) => sum + t.value, 0) * 100
        ) / 100;

        return NextResponse.json({ transactions, totalDebits });

    } catch (error: any) {
        console.error('[ajuri-calc] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Erro interno ao processar o extrato.' },
            { status: 500 }
        );
    }
}
