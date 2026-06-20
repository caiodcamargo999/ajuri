"use client"
import { ChatInterface } from "@/components/ai/chat-interface"

import { redirect } from "next/navigation"

export default function AssistentesIAPage() {
    redirect('/dashboard');
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 h-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agente Ajuri X</h1>
                <p className="text-muted-foreground mt-2">
                    Seu assistente jurídico especializado em alta performance. Tire dúvidas processuais, valide fatos e gere textos jurídicos.
                </p>
            </div>

            <div className="flex-1 min-h-[500px]">
                <ChatInterface />
            </div>
        </div>
    )
}
