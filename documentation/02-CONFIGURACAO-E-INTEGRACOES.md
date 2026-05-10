# 🛠️ Guia de Configuração e Integrações

Este guia é essencial para colocar o sistema em funcionamento. Todas as chaves devem ser configuradas no arquivo `.env.local`.

---

## 🔑 Variáveis de Ambiente (.env.local)

### 🤖 OpenAI (IA)
Responsável pelo chat e geração de conteúdo.
*   `OPENAI_API_KEY`: Chave secreta da plataforma OpenAI.

### ⚡ Supabase (Bancos de Dados & Auth)
*   `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública para acesso client-side.
*   `SUPABASE_SERVICE_ROLE_KEY`: Chave privada para operações administrativas.

### 📞 WhatsApp (Evolution API)
*   `EVOLUTION_API_URL`: URL da sua instância da Evolution API.
*   `EVOLUTION_API_KEY`: Global API Key da instalação.

### 💰 Pagamentos (Asaas)
*   `ASAAS_API_URL`: `https://sandbox.asaas.com/api/v3` (Teste) ou `https://api.asaas.com/api/v3` (Produção).
*   `ASAAS_API_KEY`: Chave de API gerada no painel do Asaas.

---

## 🌐 Configuração Google OAuth (Login Social)

Para configurar o botão "Entrar com Google" no Supabase:

1.  **Google Cloud Console**:
    *   **JavaScript Origins**: `http://localhost:3000`
    *   **Redirect URI**: `https://vsajqqzdvnmzmigltkup.supabase.co/auth/v1/callback`
2.  **Supabase Dashboard**:
    *   Vá em **Authentication > Providers > Google**.
    *   Cole o **Client ID** e o **Client Secret** gerados pelo Google.

---

## 📡 Webhooks e API Externa
O sistema permite que o desenvolvedor conecte o Ajuri a outras ferramentas:
*   **Outbound (Webhooks)**: Envia dados de novos leads para URLs externas (ex: N8N, Make).
*   **Inbound (API Keys)**: Permite que sistemas externos enviem dados para o CRM do Ajuri usando o Header `Authorization: Bearer [SUA_CHAVE]`.
