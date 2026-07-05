"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, LayoutGrid, List, Users, Sparkles, Settings, Zap, Filter, FileUp, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClientList } from "@/components/clients/client-list"
import { KanbanView } from "@/components/clients/kanban-view"
import { ClientModal } from "@/components/clients/client-modal"
import { PipelineManager } from "@/components/clients/pipeline-manager"
import { CSVImportModal } from "@/components/clients/csv-import-modal"
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
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [currentPipelineId, setCurrentPipelineId] = useState<string>("");

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [editingClient, setEditingClient] = useState<CRMClient | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState<"TIMELINE" | "WHATSAPP" | "TASKS">("TIMELINE");
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
                    tasks: c.tasks || [],
                    tags: c.tags || []
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

    const handleSaveClient = (clientData: CRMClient, options?: { closeModal?: boolean, showToast?: boolean }) => {
        const defaultOptions = { closeModal: true, showToast: true, ...options };
        let newClients: CRMClient[];

        // Ensure client has a pipeline ID (use current if new)
        const clientToSave = {
            ...clientData,
            pipelineId: clientData.pipelineId || currentPipelineId
        };

        const exists = clients.some(c => c.id === clientToSave.id);

        if (exists) {
            newClients = clients.map(c => c.id === clientToSave.id ? clientToSave : c);
            if (defaultOptions.showToast) toast.success("Cliente atualizado!");
        } else {
            newClients = [...clients, clientToSave];
            if (defaultOptions.showToast) toast.success("Novo cliente cadastrado!");
        }

        saveClientsToLocalStorage(newClients);

        // Trigger Webhooks
        triggerWebhooks(exists ? "CLIENT_UPDATED" : "CLIENT_CREATED", clientToSave);

        if (defaultOptions.closeModal) {
            setIsModalOpen(false);
            setEditingClient(null);
        }
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
        setSelectedClients([]);
    };

    const handleBulkDelete = () => {
        if (selectedClients.length === 0) return;
        
        if (confirm(`Tem certeza que deseja excluir ${selectedClients.length} leads selecionados?`)) {
            const newClients = clients.filter(c => !selectedClients.includes(c.id));
            saveClientsToLocalStorage(newClients);
            setSelectedClients([]);
            toast.success(`${selectedClients.length} leads excluídos com sucesso!`);
        }
    };

    const toggleClientSelection = (clientId: string) => {
        setSelectedClients(prev => 
            prev.includes(clientId) 
                ? prev.filter(id => id !== clientId) 
                : [...prev, clientId]
        );
    };

    const clearSelection = () => setSelectedClients([]);

    const handleEditClient = (client: CRMClient) => {
        setEditingClient(client);
        setModalInitialTab("TIMELINE");
        setIsModalOpen(true);
    };

    const handleCreateClientByStatus = (status: ClientStatus) => {
        const tempClient: Partial<CRMClient> = {
            status,
            pipelineId: currentPipelineId
        };
        setEditingClient(tempClient as CRMClient);
        setModalInitialTab("TIMELINE");
        setIsModalOpen(true);
    };

    const handleChat = (client: CRMClient) => {
        setEditingClient(client);
        setModalInitialTab("WHATSAPP");
        setIsModalOpen(true);
    };

    const handleUpdateClient = (updatedClient: CRMClient) => {
        const newClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        saveClientsToLocalStorage(newClients);

        triggerWebhooks("CLIENT_UPDATED", updatedClient);
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

    const handleImportCSV = (newClients: CRMClient[]) => {
        const combinedClients = [...clients, ...newClients];
        saveClientsToLocalStorage(combinedClients);
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
        <div className="flex flex-1 flex-col animate-in fade-in duration-300 relative w-full">

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 relative z-10 min-w-0">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 flex-wrap">
                    <div className="space-y-4 min-w-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                                    Gestão de Clientes
                                </h1>
                                <p className="text-zinc-500 text-sm md:text-base font-medium">
                                    Pipeline inteligente para leads jurídicos e acompanhamento de clientes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border backdrop-blur-md w-full sm:w-auto overflow-x-auto">
                            <Select value={currentPipelineId} onValueChange={setCurrentPipelineId}>
                                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-transparent border-none font-bold focus:ring-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                        <SelectValue placeholder="Selecione o Funil" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {pipelines.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="font-medium">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-xl"
                                onClick={() => setIsPipelineManagerOpen(true)}
                                title="Gerenciar Pipelines"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setIsImportModalOpen(true)}
                            className="font-bold h-12 px-6 rounded-2xl transition-all w-full sm:w-auto"
                        >
                            <FileUp className="h-5 w-5 mr-2" /> Importar CSV
                        </Button>

                        <Button
                            onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
                            className="font-black h-12 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap w-full sm:w-auto"
                        >
                            <PlusCircle className="h-5 w-5 mr-2" /> Novo Cliente
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome, email ou CPF..."
                            className="pl-11 h-12 rounded-2xl transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="hidden xl:flex items-center px-4 h-12 bg-muted/50 border rounded-2xl">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                {filteredClients.length} Leads Ativos
                            </span>
                        </div>

                        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex-1 md:flex-none">
                            <TabsList className="bg-muted/50 border p-1 rounded-2xl h-12 w-full">
                                <TabsTrigger value="kanban" className="rounded-xl gap-2 font-bold text-xs h-10 px-6">
                                    <LayoutGrid className="h-4 w-4" /> Kanban
                                </TabsTrigger>
                                <TabsTrigger value="list" className="rounded-xl gap-2 font-bold text-xs h-10 px-6">
                                    <List className="h-4 w-4" /> Lista
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <main className="flex-1 min-h-0 min-w-0 w-full overflow-hidden">
                    <div className={cn(
                        "h-full animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-w-0 overflow-hidden",
                        view === "kanban" ? "" : "bg-card rounded-2xl border"
                    )}>
                        {view === "list" ? (
                            <ClientList
                                clients={filteredClients}
                                onEdit={handleEditClient}
                                onChat={handleChat}
                                onDelete={handleDeleteClient}
                                selectedClients={selectedClients}
                                onToggleSelection={toggleClientSelection}
                            />
                        ) : (
                            <KanbanView
                                clients={filteredClients.filter(c => c.pipelineId === currentPipelineId)}
                                columns={kanbanColumns}
                                onEditClient={handleEditClient}
                                onMoveClient={handleMoveClient}
                                onDeleteClient={handleDeleteClient}
                                onCreateClient={handleCreateClientByStatus}
                                onChat={handleChat}
                                selectedClients={selectedClients}
                                onToggleSelection={toggleClientSelection}
                            />
                        )}
                    </div>
                </main>

                {/* Barra de Ações em Massa */}
                {selectedClients.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3 pr-6 border-r">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {selectedClients.length}
                            </div>
                            <span className="text-sm font-bold whitespace-nowrap">Leads selecionados</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearSelection}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Desmarcar Tudo
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={handleBulkDelete}
                                className="rounded-xl"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Selecionados
                            </Button>
                        </div>
                    </div>
                )}

                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveClient}
                    onDelete={handleDeleteClient}
                    editingClient={editingClient}
                    initialTab={modalInitialTab}
                />

                {/* Gerenciadores */}
                <PipelineManager
                    open={isPipelineManagerOpen}
                    onOpenChange={setIsPipelineManagerOpen}
                    pipelines={pipelines}
                    onSave={handleSavePipelines}
                />

                <CSVImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImportCSV}
                    currentPipelineId={currentPipelineId}
                    pipelines={pipelines}
                />
            </div>
        </div>
    );
}
