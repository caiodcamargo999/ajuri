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

        const instance = config?.instanceName || process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE_NAME || "cabeca_drop";
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

    public formatNumber(number: string): string {
        const hasPlus = number.trim().startsWith('+');
        let cleanNumber = number.replace(/\D/g, "");
        
        if (hasPlus) {
            // Se o usuário digitou +, assumimos que ele já forneceu o DDI correto
            return cleanNumber;
        }

        // Se já começa com 55 e tem tamanho de número brasileiro com DDI
        if (cleanNumber.startsWith("55") && (cleanNumber.length === 12 || cleanNumber.length === 13)) {
            return cleanNumber;
        }
        
        // Se a pessoa digitou o DDD com um zero na frente (ex: 04899999999)
        if (cleanNumber.startsWith("0") && (cleanNumber.length === 11 || cleanNumber.length === 12)) {
            cleanNumber = cleanNumber.substring(1);
        }

        // Adiciona o 55 como padrão para números brasileiros sem DDI
        if (cleanNumber.length === 10 || cleanNumber.length === 11) {
            return `55${cleanNumber}`;
        }

        return cleanNumber;
    }

    /**
     * Envia uma mensagem de texto simples
     */
    async sendMessage(number: string, text: string, config?: EvolutionConfig) {
        const cleanNumber = this.formatNumber(number);
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
        const cleanNumber = this.formatNumber(number);
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
     * Envia um Áudio Gravado (Voice Note)
     */
    async sendAudio(number: string, base64: string, config?: EvolutionConfig) {
        const cleanNumber = this.formatNumber(number);
        // Remove the data URI prefix if it exists to ensure clean base64 string
        const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

        return this.request("/message/sendWhatsAppAudio/{instance}", "POST", config, {
            number: cleanNumber,
            options: {
                delay: 1200,
                presence: "recording",
                encoding: true
            },
            audio: base64Data
        });
    }

    /**
     * Verifica se o número tem WhatsApp
     */
    async checkNumber(number: string, config?: EvolutionConfig) {
        const cleanNumber = this.formatNumber(number);
        return this.request("/message/checkNumber/{instance}", "POST", config, {
            numbers: [cleanNumber]
        });
    }

    /**
     * Busca o histórico de mensagens de um contato
     */
    async findMessages(numberOrJid: string, config?: EvolutionConfig) {
        let remoteJid = numberOrJid;
        if (!numberOrJid.includes('@')) {
            const cleanNumber = this.formatNumber(numberOrJid);
            remoteJid = `${cleanNumber}@s.whatsapp.net`;
        }
        
        return this.request("/chat/findMessages/{instance}", "POST", config, {
            where: {
                remoteJid: remoteJid
            }
        });
    }

    /**
     * Obtém o base64 de uma mídia
     */
    async getMediaBase64(message: any, config?: EvolutionConfig) {
        return this.request("/chat/getBase64FromMediaMessage/{instance}", "POST", config, {
            message: message
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
