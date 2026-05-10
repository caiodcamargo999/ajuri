export const evolutionService = {
    baseUrl: process.env.EVOLUTION_API_URL || '',
    // Generally Evolution API uses an API Key in the header 'apikey'
    apiKey: process.env.EVOLUTION_API_KEY || '',
    instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'ajuri_bot',

    headers() {
        return {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
        }
    },

    /**
     * Sends a text message to a specific number.
     * @param number The phone number using DDI+DDD+Number format (e.g. 5511999999999)
     * @param text The message text
     */
    async sendText(number: string, text: string) {
        if (!this.baseUrl || !this.apiKey) {
            console.warn("Evolution API credentials not set.");
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify({
                    number,
                    options: {
                        delay: 1200,
                        presence: "composing",
                        linkPreview: false
                    },
                    textMessage: {
                        text
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Evolution API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to send WhatsApp message:", error);
            throw error;
        }
    },

    /**
     * Checks the connection status of the instance.
     */
    async checkConnection() {
        if (!this.baseUrl || !this.apiKey) return { status: 'disconnected', reason: 'No config' };
        try {
            const response = await fetch(`${this.baseUrl}/instance/connectionState/${this.instanceName}`, {
                headers: this.headers()
            });
            return await response.json();
        } catch (error) {
            console.error("Evolution status check failed", error);
            return { status: 'error' };
        }
    }
};
