"use client";

import { usePetition } from "@/contexts/PetitionContext";
import { ChargesForm } from "@/components/forms/ChargesForm";
import { ScreenshotUpload } from "@/components/forms/ScreenshotUpload";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { ChargeItem, PetitionType } from "@/types/petition";

export default function ChargesPage() {
    const { data, updateCharges } = usePetition();
    const router = useRouter();

    // Helper to handle partial updates by calling the giant updateCharges function
    const handleUpdate = (
        charges: ChargeItem[] = data.charges,
        desc: string = data.chargeDescription,
        type: PetitionType = data.petitionType,
        moral: number = data.moralDamage,
        time: number = data.wastedTimeDamage,
        screenshots: string[] = data.chargeScreenshots
    ) => {
        updateCharges(charges, desc, type, moral, time, screenshots);
    };

    return (
        <div className="space-y-6">
            <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                <ChargesForm
                    petitionType={data.petitionType}
                    chargeDescription={data.chargeDescription}
                    charges={data.charges}
                    moralDamage={data.moralDamage}
                    wastedTimeDamage={data.wastedTimeDamage}
                    onPetitionTypeChange={(v) => handleUpdate(undefined, undefined, v)}
                    onChargeDescriptionChange={(v) => handleUpdate(undefined, v)}
                    onChargesChange={(v) => handleUpdate(v)}
                    onMoralDamageChange={(v) => handleUpdate(undefined, undefined, undefined, v)}
                    onWastedTimeDamageChange={(v) => handleUpdate(undefined, undefined, undefined, undefined, v)}
                />

                <div className="section-divider border-b border-border my-6" />

                <ScreenshotUpload
                    screenshots={data.chargeScreenshots}
                    onScreenshotsChange={(v) => handleUpdate(undefined, undefined, undefined, undefined, undefined, v)}
                />
            </div>
            <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/create/bank")}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
                <Button onClick={() => router.push("/create/preview")}>
                    Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
