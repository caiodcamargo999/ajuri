import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createClient } from '@/utils/supabase/server'; // adicionei a importacao do supabase server para validar sessão de quem loga
import { NextResponse } from 'next/server'; // importacao do nextresponse para lidar com erro 401

// Create an OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to nodejs for RAG compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
    // criando validacao de autenticacao - importante pq bloqueia chamadas anonimas na api
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    // --- RAG Integration ---
    const lastMessage = messages[messages.length - 1];
    let context = "";

    // Only search context if it's a user message
    if (lastMessage && lastMessage.role === 'user') {
        try {
            // Dynamically import the service
            const { searchKnowledgeBase } = await import('@/lib/services/knowledge-base');
            // passando user.id para a funcao para isolar os dados.
            const similarDocs = await searchKnowledgeBase(lastMessage.content, user.id);

            if (similarDocs && similarDocs.length > 0) {
                // Combine the content of the most similar documents
                context = similarDocs.map((doc: any) => doc.content).join('\n\n---\n\n');
                console.log("RAG Context Found:", similarDocs.length, "documents");
            }
        } catch (e) {
            console.error("RAG Search Error:", e);
        }
    }

    const systemPrompt = `Você é o "Ajuri AI", um AGENTE DE EXECUÇÃO jurídico de elite da Ajuri App.

Sua missão é EXECUTAR AGORA as tarefas que o usuário pede. 

REGRAS DE OURO:
1. Se o usuário quiser cadastrar um lead (ex: "Crie um lead para Jonas..."), você DEVE usar a ferramenta 'register_crm_client'.
2. Se o usuário quiser ir para uma página (ex: "Vá para clientes"), você DEVE usar 'navigate_to'.
3. Se o usuário pedir para ENVIAR MENSAGEM WHATSAPP (ex: "Mande um zap para o cliente X...", "Avise o cliente que o processo andou..."), USE A FERRAMENTA 'send_whatsapp_message'.
4. Após chamar a ferramenta 'register_crm_client', sua resposta de texto DEVE ser EXATAMENTE: "criado!" e nada mais.
5. NUNCA mostre o JSON bruto.
6. Seja direto e execute o comando imediatamente.

CONTEXTO JURÍDICO:
${context ? context : "Nenhum documento encontrado."}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: [
            {
                type: "function",
                function: {
                    name: "navigate_to",
                    description: "Navega para uma página específica do sistema.",
                    parameters: {
                        type: "object",
                        properties: {
                            page: { type: "string", enum: ["dashboard", "clientes", "peticoes", "processos", "customizar", "ajuri_x", "agente", "integracoes"] }
                        },
                        required: ["page"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "register_crm_client",
                    description: "Cadastra obrigatoriamente um novo lead no CRM.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Nome completo do lead" },
                            cpf: { type: "string", description: "CPF formatado ou apenas números" },
                            phone: { type: "string", description: "Telefone com DDD" },
                            obs: { type: "string", description: "Observações adicionais ou resumo do caso" }
                        },
                        required: ["name"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "send_whatsapp_message",
                    description: "Envia uma mensagem de WhatsApp para um número específico.",
                    parameters: {
                        type: "object",
                        properties: {
                            phone: { type: "string", description: "Número de telefone com DDD (apenas números)" },
                            message: { type: "string", description: "Conteúdo da mensagem a ser enviada" }
                        },
                        required: ["phone", "message"]
                    }
                }
            }
        ],
        tool_choice: "auto"
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}