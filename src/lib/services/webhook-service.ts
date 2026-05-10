import { CRMIntegration, CRMEvent, CRMClient } from "@/types/crm";

const INTEGRATION_KEY = "ajuri_crm_integrations";

export async function triggerWebhooks(event: CRMEvent, payload: any) {
    if (typeof window === "undefined") return;

    try {
        const stored = localStorage.getItem(INTEGRATION_KEY);
        if (!stored) return;

        const integrations: CRMIntegration[] = JSON.parse(stored);
        const activeWebhooks = integrations.filter(i =>
            i.active &&
            i.type === "WEBHOOK" &&
            i.config.url &&
            i.config.events?.includes(event)
        );

        if (activeWebhooks.length === 0) return;

        console.log(`[WebhookService] Triggering ${activeWebhooks.length} webhooks for event: ${event}`);

        const promises = activeWebhooks.map(async (integration) => {
            try {
                const response = await fetch(integration.config.url!, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Ajuri-Event": event,
                        "X-Ajuri-Integration-Id": integration.id
                    },
                    body: JSON.stringify({
                        event,
                        timestamp: new Date().toISOString(),
                        integrationName: integration.name,
                        data: payload
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log(`[WebhookService] Success for ${integration.name}`);
                return { id: integration.id, success: true };
            } catch (error) {
                console.error(`[WebhookService] Failed for ${integration.name}:`, error);
                return { id: integration.id, success: false, error };
            }
        });

        return await Promise.all(promises);
    } catch (error) {
        console.error("[WebhookService] Error processing webhooks:", error);
    }
}
