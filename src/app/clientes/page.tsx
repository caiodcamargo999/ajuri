"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, LayoutGrid, List, Users, Sparkles, Settings, Zap, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClientList } from "@/components/clients/client-list"
import { KanbanView } from "@/components/clients/kanban-view"
import { ClientModal } from "@/components/clients/client-modal"
import { ClientChatSheet } from "@/components/clients/client-chat-sheet"
import { PipelineManager } from "@/components/clients/pipeline-manager"
import { CRMClient, ClientStatus, CRMPipeline, CRMIntegration, DEFAULT_STAGES, CRMStage } from "@/types/crm"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { triggerWebhooks } from "@/lib/services/webhook-service"

const STORAGE_KEY = "ajuri_crm_clients";
const PIPELINE_KEY = "ajuri_crm_pipelines";
const INTEGRATION_KEY = "ajuri_crm_integrations";

export default function ClientesPage() {
    const [view, setView] = useState<"list" | "kanban">("kanban");
    const [clients, setClients] = useState<CRMClient[]>([]);

    // New State for Pipelines & Integrations
    const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
    const [integrations, setIntegrations] = useState<CRMIntegration[]>([]);
    const [currentPipelineId, setCurrentPipelineId] = useState<string>("");

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);

    const [editingClient, setEditingClient] = useState<CRMClient | null>(null);
    const [chatClient, setChatClient] = useState<CRMClient | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        // Load Pipelines
        const storedPipelines = localStorage.getItem(PIPELINE_KEY);
        let loadedPipelines: CRMPipeline[] = [];
        if (storedPipelines) {
            try {
                loadedPipelines = JSON.parse(storedPipelines);
            } catch (e) {
                console.error("Failed to parse pipelines", e);
            }
        }

        if (loadedPipelines.length === 0) {
            // Create Default Pipeline
            const defaultPipeline: CRMPipeline = {
                id: "default",
                name: "Funil Padrão",
                stages: DEFAULT_STAGES,
                isDefault: true
            };
            loadedPipelines = [defaultPipeline];
            localStorage.setItem(PIPELINE_KEY, JSON.stringify(loadedPipelines));
        }

        setPipelines(loadedPipelines);
        if (!currentPipelineId) {
            setCurrentPipelineId(loadedPipelines[0].id);
        }

        // Load Integrations
        const storedIntegrations = localStorage.getItem(INTEGRATION_KEY);
        if (storedIntegrations) {
            try {
                setIntegrations(JSON.parse(storedIntegrations));
            } catch (e) {
                console.error("Failed to parse integrations", e);
            }
        }

        // Load Clients
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Data Migration: Ensure all clients have valid status and pipelineId
                const validStatuses = ["NOVO", "QUALIFICACAO", "APRESENTACAO", "NEGOCIACAO", "FECHADO", "PERDIDO", "ARQUIVADO"]; // For legacy check

                const sanitized = parsed.map((c: any) => ({
                    ...c,
                    pipelineId: c.pipelineId || "default", // Assign to default if missing
                    activities: c.activities || [],
                    tasks: c.tasks || []
                }));

                // Only update storage if data changed (simple check)
                if (JSON.stringify(sanitized) !== JSON.stringify(parsed)) {
                    saveClientsToLocalStorage(sanitized);
                } else {
                    setClients(sanitized);
                }
            } catch (e) {
                console.error("Failed to parse clients", e);
                setClients([]);
            }
        }
        setLoading(false);
    }, []);

    const saveClientsToLocalStorage = (newClients: CRMClient[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients));
        setClients(newClients);
    };

    const handleSaveClient = (clientData: CRMClient) => {
        let newClients: CRMClient[];

        // Ensure client has a pipeline ID (use current if new)
        const clientToSave = {
            ...clientData,
            pipelineId: clientData.pipelineId || currentPipelineId
        };

        const exists = clients.some(c => c.id === clientToSave.id);

        if (exists) {
            newClients = clients.map(c => c.id === clientToSave.id ? clientToSave : c);
            toast.success("Cliente atualizado com sucesso!");
        } else {
            newClients = [...clients, clientToSave];
            toast.success("Novo cliente cadastrado!");
        }

        saveClientsToLocalStorage(newClients);

        // Trigger Webhooks
        triggerWebhooks(exists ? "CLIENT_UPDATED" : "CLIENT_CREATED", clientToSave);

        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleMoveClient = (clientId: string, newStatus: ClientStatus) => {
        const newClients = clients.map(c =>
            c.id === clientId ? { ...c, status: newStatus, lastUpdate: new Date().toISOString() } : c
        );
        saveClientsToLocalStorage(newClients);

        const updatedClient = newClients.find(c => c.id === clientId);
        if (updatedClient) triggerWebhooks("STATUS_CHANGED", updatedClient);

        toast.info("Status atualizado.");
    };

    const handleDeleteClient = (clientId: string) => {
        const newClients = clients.filter(c => c.id !== clientId);
        saveClientsToLocalStorage(newClients);
        toast.success("Lead removido com sucesso.");
    };

    const handleEditClient = (client: CRMClient) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCreateClientByStatus = (status: ClientStatus) => {
        const tempClient: Partial<CRMClient> = {
            status,
            pipelineId: currentPipelineId
        };
        setEditingClient(tempClient as CRMClient);
        setIsModalOpen(true);
    };

    const handleChat = (client: CRMClient) => {
        setChatClient(client);
    };

    const handleUpdateClient = (updatedClient: CRMClient) => {
        const newClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        saveClientsToLocalStorage(newClients);

        triggerWebhooks("CLIENT_UPDATED", updatedClient);

        if (chatClient && chatClient.id === updatedClient.id) {
            setChatClient(updatedClient);
        }
    };

    // Pipeline & Integration Management Handlers
    const handleSavePipelines = (newPipelines: CRMPipeline[]) => {
        setPipelines(newPipelines);
        localStorage.setItem(PIPELINE_KEY, JSON.stringify(newPipelines));

        // Ensure current pipeline is still valid
        if (!newPipelines.find(p => p.id === currentPipelineId)) {
            setCurrentPipelineId(newPipelines[0]?.id || "");
        }
    };

    const handleSaveIntegrations = (newIntegrations: CRMIntegration[]) => {
        setIntegrations(newIntegrations);
        localStorage.setItem(INTEGRATION_KEY, JSON.stringify(newIntegrations));
    };

    const filteredClients = clients.filter(c => {
        const matchesQuery = (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter by Pipeline!
        // If client has no pipelineId, assume default (legacy) or handle properly. 
        // We assigned defaults on load, so it should be fine.
        const matchesPipeline = c.pipelineId === currentPipelineId;

        return matchesQuery && matchesPipeline;
    });

    const currentPipeline = pipelines.find(p => p.id === currentPipelineId);

    // Map current stages to columns format expected by Kanban
    const kanbanColumns = currentPipeline?.stages.map(s => ({
        id: s.id as ClientStatus, // Cast is necessary but kind of loose string now
        title: s.name,
        color: s.color
    })) || [];

    if (loading) return null;

    return (
        <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-700 bg-black overflow-hidden relative w-full">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 h-full relative z-10 min-w-0">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 flex-wrap">
                    <div className="space-y-4 min-w-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <Users className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    Gestão de Clientes
                                </h1>
                                <p className="text-zinc-500 text-sm md:text-base font-medium">
                                    Pipeline inteligente para leads jurídicos e acompanhamento de clientes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                            <Select value={currentPipelineId} onValueChange={setCurrentPipelineId}>
                                <SelectTrigger className="w-[160px] md:w-[200px] h-11 bg-transparent border-none font-bold text-white focus:ring-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        <SelectValue placeholder="Selecione o Funil" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800">
                                    {pipelines.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="font-medium text-white">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-xl hover:bg-white/5 text-zinc-400"
                                onClick={() => setIsPipelineManagerOpen(true)}
                                title="Gerenciar Pipelines"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>

                        <Button
                            onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                        >
                            <PlusCircle className="h-5 w-5 mr-2" /> Novo Cliente
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome, email ou CPF..."
                            className="pl-11 bg-zinc-950/40 border-white/5 h-12 rounded-2xl focus:ring-amber-500/20 focus:border-amber-500/40 transition-all font-medium text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="hidden xl:flex items-center px-4 h-12 bg-zinc-950/20 border border-white/5 rounded-2xl">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                {filteredClients.length} Leads Ativos
                            </span>
                        </div>

                        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex-1 md:flex-none">
                            <TabsList className="bg-zinc-950/50 border border-white/5 p-1 rounded-2xl h-12 w-full">
                                <TabsTrigger value="kanban" className="rounded-xl gap-2 font-bold text-xs h-10 px-6 data-[state=active]:bg-white/5 data-[state=active]:text-white">
                                    <LayoutGrid className="h-4 w-4" /> Kanban
                                </TabsTrigger>
                                <TabsTrigger value="list" className="rounded-xl gap-2 font-bold text-xs h-10 px-6 data-[state=active]:bg-white/5 data-[state=active]:text-white">
                                    <List className="h-4 w-4" /> Lista
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <main className="flex-1 min-h-0 min-w-0 w-full overflow-hidden">
                    <div className={cn(
                        "h-full animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-w-0 overflow-hidden",
                        view === "kanban" ? "" : "bg-zinc-950/20 rounded-2xl border border-white/5"
                    )}>
                        {view === "list" ? (
                            <ClientList
                                clients={filteredClients}
                                onEdit={handleEditClient}
                                onDelete={handleDeleteClient}
                            />
                        ) : (
                            <KanbanView
                                clients={filteredClients}
                                columns={kanbanColumns}
                                onEditClient={handleEditClient}
                                onMoveClient={handleMoveClient}
                                onDeleteClient={handleDeleteClient}
                                onCreateClient={handleCreateClientByStatus}
                                onChat={handleChat}
                            />
                        )}
                    </div>
                </main>

                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveClient}
                    onDelete={handleDeleteClient}
                    editingClient={editingClient}
                />

                <ClientChatSheet
                    open={!!chatClient}
                    onOpenChange={(open) => !open && setChatClient(null)}
                    client={chatClient}
                    onUpdateClient={handleUpdateClient}
                />

                {/* Gerenciadores */}
                <PipelineManager
                    open={isPipelineManagerOpen}
                    onOpenChange={setIsPipelineManagerOpen}
                    pipelines={pipelines}
                    onSave={handleSavePipelines}
                />
            </div>
        </div>
    );
}
