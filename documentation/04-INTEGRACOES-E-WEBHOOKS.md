# 🔌 Integrações e Webhooks (CRM Automático)

Este documento detalha o funcionamento técnico das integrações no Ajuri App, abrangendo desde o disparo de dados (Webhooks) até a entrada de informações via API.

---

## 1. Webhooks (Outbound / Saída)
Os webhooks permitem que o Ajuri App notifique sistemas externos em tempo real sempre que ocorre um evento importante.

### Como funciona:
*   **Trigger**: O sistema detecta uma ação (ex: Novo Lead Criado).
*   **Payload**: Um JSON contendo todos os dados do evento é enviado via método **POST** para a URL configurada.
*   **Destinos Ideais**: Make.com, N8N, servidores próprios ou Google Sheets.

### Eventos Suportados:
1.  **`CLIENT_CREATED`**: Disparado quando um lead é cadastrado (Manualmente, via Chat AI ou via AJURI X).
2.  **`CLIENT_UPDATED`**: Disparado quando qualquer informação do lead é alterada.
3.  **`STATUS_CHANGED`**: Disparado especificamente quando o lead muda de estágio no Kanban (ex: De "Qualificação" para "Fechado").

---

## 2. API Keys (Inbound / Entrada)
As chaves de API permitem que ferramentas externas "conversem" com o CRM do Ajuri de forma segura.

### Autenticação:
Todas as requisições devem incluir o cabeçalho de autorização:
`Authorization: Bearer [SUA_CHAVE_GERADA]`

### Endpoint Principal (Em desenvolvimento):
`POST /api/crm/leads`
*   Permite cadastrar um lead vindo de um formulário de site externo ou Landing Page diretamente no pipeline do Ajuri.

---

## 3. Fluxo de Sincronização AJURI X -> CRM
Uma das integrações nativas mais poderosas do sistema ocorre entre o gerador de petições e o banco de dados de clientes:

1.  O usuário preenche os dados do autor no **AJURI X**.
2.  Ao clicar em "Gerar" ou "Salvar Rascunho", o sistema executa o `handleCRMIntegration`:
    *   **Se o CPF já existe**: Atualiza todos os dados cadastrais (endereço, profissão, etc) garantindo que o CRM esteja sempre atualizado.
    *   **Se não existe**: Cria um novo lead automaticamente no estágio "Novo Lead".

---

## 💡 Melhores Práticas para Desenvolvedores
*   **Retry Logic**: Webhooks não possuem sistema de retry nativo no frontend. Recomenda-se usar um middleware se a entrega for crítica.
*   **Formato de Data**: Todas as datas são enviadas no padrão ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
*   **Segurança**: Sempre valide o payload recebido no seu servidor para garantir que a origem é amigável.
