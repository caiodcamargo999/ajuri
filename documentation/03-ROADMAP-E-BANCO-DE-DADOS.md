# 🗺️ Roadmap Técnico e Estrutura de Dados

Este documento serve como guia para a evolução do sistema e detalha a migração do armazenamento local para nuvem.

---

## 📊 Estrutura do Banco de Dados (Supabase/SQL)

Para migrar os dados do `localStorage` para o PostgreSQL, utilize os scripts localizados na raiz do projeto:
*   `SUPABASE_MIGRATION_V2.sql`: Tabelas base (Perfís, Clientes, Petições).
*   `SUPABASE_MIGRATION_V3.sql`: Estrutura de vetores para o cérebro IA.

### Tabelas Principais:
1.  **Profiles**: Dados de usuário e preferências de branding.
2.  **Clients**: CRM completo com status e vinculação de pipeline.
3.  **Petitions**: Histórico de documentos gerados, rascunhos e metadados.
4.  **Documents**: Tabela vetorial (pgvector) para busca semântica do RAG.

---

## 🛣️ Roadmap de Desenvolvimento

### Fase 1: Estabilização (Concluído)
*   Interface premium cyberpunk.
*   Gerador AJURI X com suporte a `.docx` e `.pdf`.
*   CRM local com Kanban e Pipelines.
*   Chat IA com leitura de documentos.

### Fase 2: Sincronização em Nuvem (Em andamento)
*   Migração total do `localStorage` para Supabase DB.
*   Autenticação via Google/Email.
*   Gestão de assinaturas recorrentes via Asaas.

### Fase 3: Inteligência Avançada (Futuro)
*   Integração direta com DataJud para consulta de processos automática.
*   Multi-agentes IA para automação de tarefas rotineiras (agendamento).
*   Assinatura digital integrada diretamente na minuta.

---

## 💡 Recomendações Técnicas
*   **Segurança**: Nunca exponha o `SUPABASE_SERVICE_ROLE_KEY` no frontend.
*   **Performance**: Use `Suspense` para carregamento de componentes pesados (Gráficos).
*   **Escalabilidade**: Prefira Server Actions para mutações de dados para manter o bundle client reduzido.
