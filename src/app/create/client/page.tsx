"use client";

import { usePetition } from "@/contexts/PetitionContext";
import { ClientForm } from "@/components/forms/ClientForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";

export default function ClientPage() {
    const { data, updateClient } = usePetition();
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                <ClientForm data={data.client} onChange={updateClient} />
            </div>
            <div className="flex justify-between">
                <Button variant="ghost" onClick={() => router.push("/")} >
                    <ChevronLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button onClick={() => router.push("/create/bank")}>
                    Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
