export interface EvolutionMessageResponse {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        conversation: string;
    };
    messageTimestamp: number;
    status: string;
}

export interface EvolutionConfig {
    instanceName?: string;
    instanceToken?: string; // Optinal if using global API Key
}

export class EvolutionService {
    private apiUrl: string;
    private globalApiKey: string;

    constructor() {
        this.apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "";
        this.globalApiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || "";
    }

    private async request(endpoint: string, method: string = "GET", config?: EvolutionConfig, body?: any) {
        if (!this.apiUrl || !this.globalApiKey) {
            console.error("Evolution API configuration missing via environment variables.");
            throw new Error("Configuração da API Evolution não encontrada. Verifique as variáveis de ambiente.");
        }

        const instance = config?.instanceName || process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE_NAME || "default";
        const url = `${this.apiUrl}${endpoint}`.replace("{instance}", instance);

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "apikey": this.globalApiKey
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Evolution API Error: ${error}`);
        }

        return response.json();
    }

    /**
     * Envia uma mensagem de texto simples
     */
    async sendMessage(number: string, text: string, config?: EvolutionConfig) {
        const cleanNumber = number.replace(/\D/g, "");
        return this.request("/message/sendText/{instance}", "POST", config, {
            number: cleanNumber,
            options: {
                delay: 1200,
                presence: "composing",
                linkPreview: false
            },
            textMessage: {
                text
            },
            text: text // Adicionado para compatibilidade com versões diferentes
        });
    }

    /**
     * Envia um PDF/Documento
     */
    async sendMedia(number: string, caption: string, base64: string, fileName: string, config?: EvolutionConfig) {
        const cleanNumber = number.replace(/\D/g, "");
        return this.request("/message/sendMedia/{instance}", "POST", config, {
            number: cleanNumber,
            options: {
                delay: 1200,
                presence: "composing"
            },
            mediaMessage: {
                mediatype: "document",
                caption: caption,
                media: base64,
                fileName: fileName
            }
        });
    }

    /**
     * Verifica se o número tem WhatsApp
     */
    async checkNumber(number: string, config?: EvolutionConfig) {
        const cleanNumber = number.replace(/\D/g, "");
        return this.request("/message/checkNumber/{instance}", "POST", config, {
            numbers: [cleanNumber]
        });
    }

    /**
     * Obtém o QR Code para conexão
     */
    async getQrCode(instanceName: string) {
        return this.request("/instance/connect/{instance}", "GET", { instanceName });
    }

    /**
     * Cria uma nova instância para um cliente
     */
    async createInstance(instanceName: string) {
        return this.request("/instance/create", "POST", undefined, {
            instanceName: instanceName,
            token: "", // Optional
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        });
    }

    /**
     * Status da Instância
     */
    async getInstanceStatus(instanceName: string) {
        return this.request("/instance/connectionState/{instance}", "GET", { instanceName });
    }

    /**
     * Logout da Instância
     */
    async logoutInstance(instanceName: string) {
        return this.request("/instance/logout/{instance}", "DELETE", { instanceName });
    }

    /**
     * Deleta a Instância
     */
    async deleteInstance(instanceName: string) {
        return this.request("/instance/delete/{instance}", "DELETE", { instanceName });
    }
}

export const evolutionService = new EvolutionService();
