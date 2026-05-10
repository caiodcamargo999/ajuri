"use client";

import { usePetition } from "@/contexts/PetitionContext";
import { BankForm } from "@/components/forms/BankForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";

export default function BankPage() {
    const { data, updateBank } = usePetition();
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                <BankForm data={data.bank} onChange={updateBank} />
            </div>
            <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/create/client")}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
                <Button onClick={() => router.push("/create/charges")}>
                    Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
