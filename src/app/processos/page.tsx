"use client"

import { useEffect, useState } from "react"
import { ProcessList } from "@/components/processes/process-list"
import { ProcessModal } from "@/components/processes/process-modal"
import { Button } from "@/components/ui/button"
import { Filter, PlusCircle, Search, Briefcase, Sparkles } from "lucide-react"
import { LegalProcess } from "@/types/process"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "ajuri_legal_processes";

export default function ProcessosPage() {
    const [processes, setProcesses] = useState<LegalProcess[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<LegalProcess | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setProcesses(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const saveToLocalStorage = (newProcesses: LegalProcess[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProcesses));
        setProcesses(newProcesses);
    };

    const handleSaveProcess = (processData: LegalProcess) => {
        let newProcesses: LegalProcess[];
        const exists = processes.some(p => p.id === processData.id);

        if (exists) {
            newProcesses = processes.map(p => p.id === processData.id ? processData : p);
            toast.success("Processo atualizado com sucesso!");
        } else {
            newProcesses = [...processes, processData];
            toast.success("Processo cadastrado com sucesso!");
        }

        saveToLocalStorage(newProcesses);
        setIsModalOpen(false);
        setEditingProcess(null);
    };

    const handleEditProcess = (process: LegalProcess) => {
        setEditingProcess(process);
        setIsModalOpen(true);
    };

    const filteredProcesses = processes.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return null;

    return (
        <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-700 bg-black overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 h-full relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                <Briefcase className="w-8 h-8 text-purple-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    Gestão Processual
                                </h1>
                                <p className="text-zinc-500 text-sm md:text-base font-medium">
                                    Acompanhe o andamento dos seus casos, prazos e movimentações em tempo real.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="gap-2 bg-zinc-950/50 border-white/5 hover:bg-white/5 font-bold h-12 px-6 rounded-2xl hidden md:flex text-zinc-400">
                            <Filter className="h-4 w-4" /> Filtros Avançados
                        </Button>
                        <Button
                            onClick={() => { setEditingProcess(null); setIsModalOpen(true); }}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                        >
                            <PlusCircle className="h-5 w-5 mr-2" /> Novo Processo
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type="search"
                            placeholder="Buscar por número, ação ou cliente..."
                            className="pl-11 bg-zinc-950/40 border-white/5 h-12 rounded-2xl focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-medium text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 h-12 bg-zinc-950/20 border border-white/5 rounded-2xl leading-none">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Sincronização Ativa
                    </div>
                </div>

                <main className="flex-1 min-h-0">
                    <div className="h-full bg-zinc-950/20 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all">
                        <ProcessList
                            processes={filteredProcesses}
                            onEdit={handleEditProcess}
                        />
                    </div>
                </main>

                <ProcessModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProcess}
                    editingProcess={editingProcess}
                />
            </div>
        </div>
    )
}
