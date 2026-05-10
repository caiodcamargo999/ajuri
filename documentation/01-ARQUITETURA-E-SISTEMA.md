# 🏗️ Arquitetura e Funcionamento do Sistema

Este documento detalha como o **Ajuri App** foi construído, sua estrutura de páginas e o funcionamento do cérebro de Inteligência Artificial.

---

## 🚀 Visão Geral Tech Stack
O sistema utiliza as tecnologias mais modernas para garantir performance e escalabilidade:
*   **Frontend**: Next.js 14 (App Router) - Reatividade e SEO.
*   **Estilização**: Tailwind CSS + Shadcn/ui - Design cyberpunk premium e consistente.
*   **Banco de Dados**: Supabase (PostgreSQL) com extensão **pgvector** para busca semântica (IA).
*   **Inteligência Artificial**: OpenAI GPT-4o integrado via RAG (Retrieval Augmented Generation).
*   **Integrações**: WhatsApp (Evolution API), Pagamentos (Asaas) e Gerador de Documentos (`docx`).

---

## 📁 Mapa de Funcionalidades

### 1. 📊 Dashboard (`/dashboard`)
Portal central com métricas, gráficos interativos de leads (Pie Charts) e lista de rascunhos recentes.

### 2. ✨ AJURI X (`/ajuri-x`)
Gerador de petições inteligente. 
*   **Fluxo**: Identifica o modelo -> Coleta dados do Autor/Réu -> Calcula valores -> Gera Word/PDF.
*   **Sincronização**: Salva dados automaticamente no CRM ao gerar documentos.

### 3. 👥 CRM de Clientes (`/clientes`)
Gestão de leads com visualização em **Lista** ou **Kanban**. Permite gerenciar pipelines personalizados e histórico de atividades de cada cliente.

### 4. 🤖 Assistente IA (`/assistentes-ia`)
Chat interativo que utiliza **RAG**. Você pode anexar arquivos (PDF/TXT) e a IA "aprende" o conteúdo para responder perguntas específicas do escritório.

### 5. 🔌 Integrações (`/integracoes`)
Página dedicada para configurar Webhooks (saída de dados) e Chaves de API (entrada de dados).

---

## 🧠 O Cérebro IA (RAG)
O sistema de "Memória Jurídica" funciona em 3 etapas:
1.  **Ingestão**: O usuário envia um arquivo no chat.
2.  **Vetorização**: O texto é extraído e transformado em vetores (embeddings) pela OpenAI e salvo no Supabase.
3.  **Recuperação**: Quando o usuário pergunta algo, o sistema busca os fragmentos de texto mais relevantes no banco e os entrega ao GPT-4o como contexto.

---

## 📂 Estrutura de Pastas
*   `src/app`: Rotas e Layouts (Páginas).
*   `src/components`: Componentes reutilizáveis (UI, Dashboards, Forms).
*   `src/types`: Definições de TypeScript (CRM, Petições, etc).
*   `src/utils`: Lógica de negócio (Geradores de PDF, Integrações, Formatação).
