import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

// Garantindo que a funcao de insercao continue recebendo metadados (onde o user_id deve ser injetado no upload do arquivo)
export async function addDocumentToKnowledgeBase(content: string, metadata: any) {
    const supabase = createClient();
    const embedding = await generateEmbedding(content);

    const { error } = await supabase.from('documents').insert({
        content,
        metadata,
        embedding,
    });

    if (error) {
        console.error('Error inserting document:', error);
        throw error;
    }
}

// Adicionado o parametro opcional 'userId' para eliminar a linha vermelha do TypeScript no route.ts
export async function searchKnowledgeBase(query: string, userId?: string) {
    const supabase = createClient();
    const embedding = await generateEmbedding(query);

    // Estruturamos os parametros dinamicamente para nao quebrar a funcao RPC atual do seu banco de dados.
    const rpcParams: any = {
        query_embedding: embedding,
        match_threshold: 0.5, // 50% similarity threshold
        match_count: 5,
    };

    // ATENCAO: Para o isolamento funcionar de fato no banco de dados, o desenvolvedor anterior precisara atualizar a funcao 'match_documents' no Supabase (SQL) para aceitar esse novo parametro de filtro. Quando ele fizer isso, basta descomentar a linha abaixo.
    // if (userId) rpcParams.match_user_id = userId;

    const { data, error } = await supabase.rpc('match_documents', rpcParams);

    if (error) {
        console.error('Error searching documents:', error);
        throw error;
    }

    return data;
}