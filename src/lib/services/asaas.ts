export const asaasService = {
    baseUrl: process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3', // Default to sandbox
    apiKey: process.env.ASAAS_API_KEY || '',

    headers() {
        return {
            'Content-Type': 'application/json',
            'access_token': this.apiKey
        }
    },

    /**
     * Creates a new customer in Asaas.
     */
    async createCustomer(customer: { name: string, cpfCnpj: string, email?: string, mobilePhone?: string }) {
        if (!this.apiKey) {
            console.warn("Asaas API Key not set.");
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/customers`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify(customer)
            });
            return await response.json();
        } catch (error) {
            console.error("Asaas createCustomer error:", error);
            throw error;
        }
    },

    /**
     * List customers based on filter (e.g., cpfCnpj or email).
     */
    async getCustomers(filters: { cpfCnpj?: string, email?: string, name?: string }) {
        if (!this.apiKey) return { data: [] }; // Mock empty return

        const params = new URLSearchParams();
        if (filters.cpfCnpj) params.append('cpfCnpj', filters.cpfCnpj);
        if (filters.email) params.append('email', filters.email);
        if (filters.name) params.append('name', filters.name);

        try {
            const response = await fetch(`${this.baseUrl}/customers?${params.toString()}`, {
                headers: this.headers()
            });
            return await response.json();
        } catch (error) {
            console.error("Asaas getCustomers error:", error);
            throw error;
        }
    },

    /**
     * Create a simple billing charge (Pix/Boleto).
     */
    async createCharge(charge: { customerId: string, value: number, dueDate: string, description?: string }) {
        if (!this.apiKey) return null;

        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify({
                    customer: charge.customerId,
                    billingType: "PIX",
                    value: charge.value,
                    dueDate: charge.dueDate,
                    description: charge.description
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Asaas createCharge error:", error);
            throw error;
        }
    }
};
