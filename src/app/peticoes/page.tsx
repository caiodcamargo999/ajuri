"use client"

import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { PlusCircle, Search, FileText, Sparkles, Loader2 } from "lucide-react"

const MyPetitionsList = dynamic(() => import("@/components/petitions/my-petitions-list").then(mod => mod.MyPetitionsList), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
    )
})
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { CustomTemplate, STORAGE_KEY_TEMPLATES } from "@/components/settings/CustomTemplateEditor"
import { CreateFromTemplateModal } from "@/components/petitions/CreateFromTemplateModal"
import { PreviewModal, DocumentType } from "@/components/docs/PreviewModal"
import { CRMClient } from "@/types/crm"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function PeticoesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    
    // Custom Templates State
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Preview Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewClientData, setPreviewClientData] = useState<Partial<CRMClient>>({});
    const [previewDocSettings, setPreviewDocSettings] = useState<any>({});

    useEffect(() => {
        const storedTemplates = localStorage.getItem(STORAGE_KEY_TEMPLATES);
        if (storedTemplates) {
            try {
                setCustomTemplates(JSON.parse(storedTemplates));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleSelectTemplate = (template: CustomTemplate) => {
        setSelectedTemplate(template);
        setIsCreateModalOpen(true);
    };

    const handleGeneratePreview = (clientData: Partial<CRMClient>, docSettings: any) => {
        setPreviewClientData(clientData);
        setPreviewDocSettings(docSettings);
        setIsCreateModalOpen(false);
        setIsPreviewModalOpen(true);
    };

    return (
        <div className="flex flex-1 flex-col animate-in fade-in duration-700 bg-black min-h-screen relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    Banco de Petições
                                </h1>
                                <p className="text-zinc-500 text-sm md:text-base font-medium">
                                    Histórico completo e gerenciamento inteligente das suas peças processuais.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/ajuri-x">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap">
                                <PlusCircle className="h-5 w-5 mr-2" /> Criar via AJURI X
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            type="search"
                            placeholder="Buscar por título ou data..."
                            className="pl-11 bg-zinc-950/40 border-white/5 h-12 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-medium text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-[200px] bg-zinc-950/50 border-white/5 h-12 rounded-2xl font-bold text-white">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all" className="font-medium text-white">Todos</SelectItem>
                                <SelectItem value="draft" className="font-medium text-white">Rascunhos</SelectItem>
                                <SelectItem value="completed" className="font-medium text-white">Finalizados</SelectItem>
                                <SelectItem value="ajuri_x" className="font-medium text-white">Gerados por IA</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="hidden xl:flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4 h-12 bg-zinc-950/20 border border-white/5 rounded-2xl leading-none">
                            <Sparkles className="w-3.5 h-3.5" />
                            Arquivado em Nuvem
                        </div>
                    </div>
                </div>

                {/* --- CUSTOM TEMPLATES BUTTONS --- */}
                {customTemplates.length > 0 && (
                    <div className="py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                            Gerar Petição a partir de Meus Modelos
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {customTemplates.map((template) => (
                                <Button
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template)}
                                    className="bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 hover:border-blue-500/30 rounded-xl transition-all"
                                >
                                    <FileText className="w-4 h-4 mr-2 text-blue-400" />
                                    {template.title}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <main className="flex-1 min-h-0">
                    <div className="h-full bg-zinc-950/20 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <MyPetitionsList searchQuery={searchQuery} filterStatus={filterStatus} />
                    </div>
                </main>
            </div>

            <CreateFromTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                template={selectedTemplate}
                onGenerate={handleGeneratePreview}
            />

            <PreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                documentType="custom"
                clientData={previewClientData}
                docSettings={previewDocSettings}
                customTemplateTitle={selectedTemplate?.title}
                customTemplateContent={selectedTemplate?.content}
            />
        </div>
    )
}
