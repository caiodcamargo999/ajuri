"use client";

import { useState, useEffect } from "react";
import { CRMIntegration, CRM_EVENTS, CRMEvent } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Zap, Check, X, Copy, Globe, ShieldCheck, Activity } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface IntegrationManagerProps {
    integrations: CRMIntegration[];
    onSave: (integrations: CRMIntegration[]) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function IntegrationManager({ integrations, onSave, open, onOpenChange }: IntegrationManagerProps) {
    const [localIntegrations, setLocalIntegrations] = useState<CRMIntegration[]>([]);

    // New integration state
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<"WEBHOOK" | "API_KEY">("WEBHOOK");
    const [newEvents, setNewEvents] = useState<CRMEvent[]>(["CLIENT_CREATED"]);

    useEffect(() => {
        if (open) {
            // Migration for modal data
            const migrated = integrations.map((i: any) => {
                const config = { ...i.config };
                if (config.event && (!config.events || config.events.length === 0)) {
                    config.events = [config.event];
                }
                if (!config.events) config.events = ["CLIENT_CREATED"];
                return { ...i, config };
            });
            setLocalIntegrations(JSON.parse(JSON.stringify(migrated)));
            setIsCreating(false);
        }
    }, [open, integrations]);

    const handleCreateIntegration = () => {
        if (!newName.trim()) {
            toast.error("O nome da integração é obrigatório.");
            return;
        }

        if (newEvents.length === 0) {
            toast.error("Selecione pelo menos um escopo.");
            return;
        }

        const newIntegration: CRMIntegration = {
            id: crypto.randomUUID(),
            name: newName,
            type: newType,
            config: {
                url: newType === "WEBHOOK" ? "" : undefined,
                key: newType === "API_KEY" ? `ajuri_${crypto.randomUUID().replace(/-/g, '')}` : undefined,
                events: newEvents
            },
            active: true
        };

        setLocalIntegrations([...localIntegrations, newIntegration]);
        setNewName("");
        setNewEvents(["CLIENT_CREATED"]);
        setIsCreating(false);
        toast.success("Integração adicionada!");
    };

    const toggleEvent = (id: string, eventId: CRMEvent) => {
        setLocalIntegrations(prev => prev.map(i => {
            if (i.id !== id) return i;
            const currentEvents = i.config.events || [];
            const updatedEvents = currentEvents.includes(eventId)
                ? currentEvents.filter(e => e !== eventId)
                : [...currentEvents, eventId];
            return { ...i, config: { ...i.config, events: updatedEvents } };
        }));
    };

    const toggleNewEvent = (eventId: CRMEvent) => {
        setNewEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(e => e !== eventId)
                : [...prev, eventId]
        );
    };

    const handleDeleteIntegration = (id: string) => {
        if (confirm("Tem certeza que deseja remover esta integração?")) {
            setLocalIntegrations(localIntegrations.filter(i => i.id !== id));
        }
    };

    const handleUpdateIntegration = (id: string, updates: Partial<CRMIntegration>) => {
        setLocalIntegrations(localIntegrations.map((i: CRMIntegration) => i.id === id ? { ...i, ...updates } : i));
    };

    const handleUpdateConfig = (id: string, configUpdates: any) => {
        setLocalIntegrations(localIntegrations.map((i: CRMIntegration) => i.id === id ? { ...i, config: { ...i.config, ...configUpdates } } : i));
    };

    const handleFinalSave = () => {
        onSave(localIntegrations);
        onOpenChange(false);
        toast.success("Integrações salvas com sucesso!");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-white/5 pb-4 bg-white/5">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Integrações e Automações
                    </DialogTitle>
                    <div className="flex items-center justify-between">
                        <DialogDescription className="text-zinc-400">
                            Conecte seu CRM a outras ferramentas via Webhook ou API.
                        </DialogDescription>
                        <a href="/integracoes" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                            Configuração Avançada <Zap className="w-3 h-3" />
                        </a>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Lista de Integrações */}
                        <div className="space-y-4">
                            {localIntegrations.length === 0 && !isCreating ? (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl bg-white/5 opacity-50 flex flex-col items-center">
                                    <Zap className="w-12 h-12 mb-3 text-zinc-700" />
                                    <p className="text-sm font-medium">Nenhuma integração configurada.</p>
                                </div>
                            ) : (
                                localIntegrations.map(integration => (
                                    <div key={integration.id} className="border border-white/5 rounded-2xl p-5 space-y-5 bg-zinc-900/50 hover:border-amber-500/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${integration.active ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-zinc-800 text-zinc-500"}`}>
                                                    {integration.type === 'WEBHOOK' ? <Globe className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-white">{integration.name}</h3>
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black border-white/10 text-zinc-500 px-2 h-4">{integration.type}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={integration.active}
                                                    onCheckedChange={(checked) => handleUpdateIntegration(integration.id, { active: checked })}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                    onClick={() => handleDeleteIntegration(integration.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                        <Activity className="w-3 h-3" /> Escopos Ativos
                                                    </label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 text-[9px] text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 px-1.5 font-black uppercase tracking-tighter"
                                                        onClick={() => handleUpdateConfig(integration.id, { events: CRM_EVENTS.map(e => e.id) })}
                                                    >
                                                        Selecionar Todos
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {CRM_EVENTS.map(event => (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => toggleEvent(integration.id, event.id)}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none ${integration.config.events?.includes(event.id)
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                                : 'bg-black/20 border-white/5 text-zinc-600'
                                                                }`}
                                                        >
                                                            <Checkbox
                                                                checked={integration.config.events?.includes(event.id)}
                                                                className="h-3 w-3 border-emerald-500/30 data-[state=checked]:bg-emerald-500"
                                                            />
                                                            <span className="text-[10px] font-bold">{event.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {integration.type === "WEBHOOK" && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                        <Globe className="w-3 h-3" /> URL de Destino
                                                    </label>
                                                    <Input
                                                        value={integration.config.url || ""}
                                                        onChange={(e) => handleUpdateConfig(integration.id, { url: e.target.value })}
                                                        placeholder="https://seu-endpoint.com/webhook"
                                                        className="h-10 text-xs font-mono bg-black/40 border-white/5 rounded-xl"
                                                    />
                                                </div>
                                            )}

                                            {integration.type === "API_KEY" && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                        <ShieldCheck className="w-3 h-3" /> Chave de API
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 bg-black/40 p-2.5 rounded-xl text-[10px] font-mono truncate border border-dashed border-white/5 text-zinc-400">
                                                            {integration.config.key}
                                                        </code>
                                                        <Button size="icon" variant="outline" className="h-10 w-10 shrink-0 border-white/5 rounded-xl" onClick={() => copyToClipboard(integration.config.key || "")}>
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Formulário de Criação */}
                        {isCreating ? (
                            <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest">Nome da Conexão</label>
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Ex: Zapier, N8N, CRM Extra..."
                                            className="h-11 bg-black/40 border-amber-500/20"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest">Tipo</label>
                                        <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                                            <SelectTrigger className="h-11 bg-black/40 border-amber-500/20"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WEBHOOK">Webhook (Outbound)</SelectItem>
                                                <SelectItem value="API_KEY">API Key (Inbound)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest">Escopos (Triggers)</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 text-[9px] text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-1.5 font-black uppercase tracking-tighter"
                                            onClick={() => setNewEvents(CRM_EVENTS.map(e => e.id))}
                                        >
                                            Selecionar Todos
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {CRM_EVENTS.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => toggleNewEvent(event.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${newEvents.includes(event.id)
                                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
                                                    : 'bg-black/20 border-white/5 text-zinc-600'
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={newEvents.includes(event.id)}
                                                    className="h-3.5 w-3.5 border-amber-500/40 data-[state=checked]:bg-amber-500"
                                                />
                                                <span className="text-[10px] uppercase font-black">{event.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setIsCreating(false)} className="hover:bg-amber-500/10">Cancelar</Button>
                                    <Button onClick={handleCreateIntegration} className="bg-amber-600 hover:bg-amber-500 px-6">Adicionar</Button>
                                </div>
                            </div>
                        ) : (
                            <Button variant="outline" className="w-full h-14 gap-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all font-bold text-zinc-400" onClick={() => setIsCreating(true)}>
                                <Plus className="w-5 h-5" /> Adicionar Nova Integração
                            </Button>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t border-white/5 bg-black/40">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white">Descartar</Button>
                    <Button onClick={handleFinalSave} className="bg-amber-600 hover:bg-amber-500 px-10">Concluir Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
