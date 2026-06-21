"use client";

import { usePetition } from "@/contexts/PetitionContext";
import { PetitionPreview } from "@/components/PetitionPreview";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { exportToWord } from "@/utils/exportWord";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandingProfile } from "@/types/petition";
import { ChevronLeft, FileDown, Eye } from "lucide-react";
import { useState, useEffect } from "react";

export default function PreviewPage() {
    const { data } = usePetition();
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const [profiles, setProfiles] = useState<BrandingProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>("");

    useEffect(() => {
        const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
        const storedActiveId = localStorage.getItem("ajuri_active_profile_id");
        if (storedProfiles) {
            const parsedProfiles = JSON.parse(storedProfiles);
            setProfiles(parsedProfiles);
            if (storedActiveId && parsedProfiles.some((p: BrandingProfile) => p.id === storedActiveId)) {
                setSelectedProfileId(storedActiveId);
            } else if (parsedProfiles.length > 0) {
                setSelectedProfileId(parsedProfiles[0].id);
            }
        }
    }, []);



    const handleExportWord = async () => {
        try {
            setIsExporting(true);
            await exportToWord(data, selectedProfileId || undefined);
            toast({
                title: "Word Gerado!",
                description: "O arquivo .docx foi baixado com sucesso.",
            });
        } catch (error) {
            console.error("Error generating Word:", error);
            toast({
                title: "Erro ao gerar Word",
                description: "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <Eye className="text-primary w-5 h-5" />
                    <h2 className="font-semibold text-lg">Revisão Final</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {profiles.length > 0 && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Modelo de Branding:</span>
                            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                                <SelectTrigger className="w-full md:w-[200px] h-9">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.profileName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" onClick={handleExportWord} disabled={isExporting} className="w-full md:w-auto">
                            <FileDown className="w-4 h-4 mr-2" />
                            Baixar Word (.docx)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Display */}
            <div className="bg-card shadow-sm border border-border rounded-xl p-0 overflow-hidden">
                <PetitionPreview data={data} className="h-[70vh] border-none" selectedProfileId={selectedProfileId} />
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/create/charges")}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
                {/* No next button, this is the end */}
            </div>
        </div>
    )
}
