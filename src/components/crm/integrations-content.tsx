"use client";

import { useState, useEffect } from "react";
import { CRMIntegration, CRM_EVENTS, CRMEvent } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Zap, Check, X, Copy, Webhook, Key, Save, ShieldCheck, Globe, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const INTEGRATION_KEY = "ajuri_crm_integrations";

export function IntegrationsContent() {
    const [localIntegrations, setLocalIntegrations] = useState<CRMIntegration[]>([]);

    // New integration state
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<"WEBHOOK" | "API_KEY">("WEBHOOK");
    const [newEvents, setNewEvents] = useState<CRMEvent[]>(["CLIENT_CREATED"]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load Integrations
        const storedIntegrations = localStorage.getItem(INTEGRATION_KEY);
        if (storedIntegrations) {
            try {
                const parsed = JSON.parse(storedIntegrations);
                // Migration: single event to events array
                const migrated = parsed.map((i: any) => {
                    const config = { ...i.config };
                    if (config.event && (!config.events || config.events.length === 0)) {
                        config.events = [config.event];
                        delete config.event;
                    }
                    if (!config.events) config.events = ["CLIENT_CREATED"];
                    return { ...i, config };
                });
                setLocalIntegrations(migrated);
                localStorage.setItem(INTEGRATION_KEY, JSON.stringify(migrated));
            } catch (e) {
                console.error("Failed to parse integrations", e);
            }
        }
        setLoading(false);
    }, []);

    const handleSaveIntegrations = (newIntegrations: CRMIntegration[]) => {
        setLocalIntegrations(newIntegrations);
        localStorage.setItem(INTEGRATION_KEY, JSON.stringify(newIntegrations));
    };

    const handleCreateIntegration = () => {
        if (!newName.trim()) {
            toast.error("O nome da integração é obrigatório.");
            return;
        }

        if (newEvents.length === 0) {
            toast.error("Selecione pelo menos um escopo para a integração.");
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

        const updated = [...localIntegrations, newIntegration];
        handleSaveIntegrations(updated);

        setNewName("");
        setNewEvents(["CLIENT_CREATED"]);
        setIsCreating(false);
        toast.success("Integração criada com sucesso!");
    };

    const toggleEvent = (id: string, eventId: CRMEvent) => {
        const integration = localIntegrations.find(i => i.id === id);
        if (!integration) return;

        const currentEvents = integration.config.events || [];
        const newEvents = currentEvents.includes(eventId)
            ? currentEvents.filter(e => e !== eventId)
            : [...currentEvents, eventId];

        handleUpdateConfig(id, { events: newEvents });
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
            const updated = localIntegrations.filter(i => i.id !== id);
            handleSaveIntegrations(updated);
            toast.success("Integração removida.");
        }
    };

    const handleUpdateIntegration = (id: string, updates: Partial<CRMIntegration>) => {
        const updated = localIntegrations.map(i => i.id === id ? { ...i, ...updates } : i);
        handleSaveIntegrations(updated);
    };

    const handleUpdateConfig = (id: string, configUpdates: any) => {
        const updated = localIntegrations.map(i => i.id === id ? { ...i, config: { ...i.config, ...configUpdates } } : i);
        handleSaveIntegrations(updated);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    if (loading) return null;

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1200px] mx-auto w-full animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Integrações e Automações
                        </h1>
                    </div>
                    <p className="text-zinc-500 text-lg max-w-2xl font-medium">
                        Conecte seu CRM jurídico a outras ferramentas via Webhook ou API para automatizar seu fluxo de trabalho.
                    </p>
                </div>

                <Button
                    className="gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 px-6 rounded-xl shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                >
                    <Plus className="h-5 w-5" /> Nova Integração
                </Button>
            </header>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Formulário de Criação Inline */}
                    {isCreating && (
                        <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden animate-in fade-in slide-in-from-top-4 shadow-2xl">
                            <CardHeader className="pb-3 bg-amber-500/10">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-amber-500" />
                                    Nova Integração
                                </CardTitle>
                                <CardDescription className="text-amber-200/50">Configure os detalhes da sua nova conexão.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-amber-500/80 font-bold uppercase text-[10px] tracking-widest">Nome Identificador</Label>
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Ex: N8N Pipeline, Google Sheets..."
                                            className="bg-black/40 border-amber-500/20 focus:ring-amber-500/20 h-11"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-amber-500/80 font-bold uppercase text-[10px] tracking-widest">Tipo de Conexão</Label>
                                        <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                                            <SelectTrigger className="bg-black/40 border-amber-500/20 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WEBHOOK">Webhook (Envio em Tempo Real)</SelectItem>
                                                <SelectItem value="API_KEY">Chave de API (Consulta Externa)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-amber-500/80 font-bold uppercase text-[10px] tracking-widest">Escopos permitidos (Triggers)</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-2 font-black uppercase tracking-tighter"
                                            onClick={() => setNewEvents(CRM_EVENTS.map(e => e.id))}
                                        >
                                            Selecionar Todos
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {CRM_EVENTS.map(event => (
                                            <div
                                                key={event.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${newEvents.includes(event.id)
                                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                                    : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/10'
                                                    }`}
                                                onClick={() => toggleNewEvent(event.id)}
                                            >
                                                <Checkbox
                                                    checked={newEvents.includes(event.id)}
                                                    className="border-amber-500/50 data-[state=checked]:bg-amber-500"
                                                />
                                                <span className="text-xs font-bold">{event.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setIsCreating(false)} className="hover:bg-amber-500/10 hover:text-amber-500">Cancelar</Button>
                                    <Button onClick={handleCreateIntegration} className="bg-amber-600 hover:bg-amber-500 px-8">Salvar e Ativar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de Integrações */}
                    <div className="space-y-4">
                        {localIntegrations.length === 0 && !isCreating ? (
                            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5 flex flex-col items-center justify-center text-zinc-500">
                                <Zap className="w-16 h-16 mb-4 text-zinc-700" />
                                <h3 className="text-xl font-bold text-zinc-300">Nenhuma integração ativa</h3>
                                <p className="mt-2 max-w-sm">Crie sua primeira automação para conectar o Ajuri a outras plataformas.</p>
                                <Button variant="outline" className="mt-6 gap-2 border-white/10 hover:bg-white/5" onClick={() => setIsCreating(true)}>
                                    <Plus className="w-4 h-4" /> Começar Agora
                                </Button>
                            </div>
                        ) : (
                            localIntegrations.map(integration => (
                                <Card key={integration.id} className="border-white/5 bg-zinc-950/40 backdrop-blur-sm overflow-hidden transition-all hover:border-amber-500/30 group">
                                    <CardHeader className="pb-3 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl transition-colors ${integration.active ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-zinc-800 text-zinc-500"}`}>
                                                {integration.type === 'WEBHOOK' ? <Globe className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                                    {integration.name}
                                                    {!integration.active && <Badge variant="outline" className="text-[10px] font-bold border-zinc-700 text-zinc-500 h-5">PAUSADO</Badge>}
                                                </CardTitle>
                                                <CardDescription className="text-[10px] font-mono uppercase tracking-widest mt-0.5 text-zinc-500">
                                                    {integration.type === 'WEBHOOK' ? 'Dynamic Outbound Webhook' : 'Secure API Access Key'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${integration.active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/40 border-white/5'}`}>
                                                <Switch
                                                    checked={integration.active}
                                                    onCheckedChange={(checked) => handleUpdateIntegration(integration.id, { active: checked })}
                                                    id={`switch-${integration.id}`}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                                <Label htmlFor={`switch-${integration.id}`} className={`text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-colors ${integration.active ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                    {integration.active ? 'On' : 'Off'}
                                                </Label>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                onClick={() => handleDeleteIntegration(integration.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 grid gap-8">
                                        <div className="grid gap-8 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest flex items-center gap-2">
                                                        <Activity className="w-3 h-3" /> Escopos Ativos
                                                    </Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 text-[9px] text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 px-1.5 font-black uppercase tracking-tighter"
                                                        onClick={() => handleUpdateConfig(integration.id, { events: CRM_EVENTS.map(e => e.id) })}
                                                    >
                                                        Selecionar Todos
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {CRM_EVENTS.map(event => (
                                                        <div
                                                            key={event.id}
                                                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group/item ${integration.config.events?.includes(event.id)
                                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                                                                : 'bg-black/20 border-transparent text-zinc-600'
                                                                }`}
                                                            onClick={() => toggleEvent(integration.id, event.id)}
                                                        >
                                                            <Checkbox
                                                                checked={integration.config.events?.includes(event.id)}
                                                                className={`border-emerald-500/30 data-[state=checked]:bg-emerald-500 h-3.5 w-3.5`}
                                                            />
                                                            <span className="text-xs font-bold leading-none">{event.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {integration.type === "WEBHOOK" && (
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest flex items-center gap-2">
                                                            <Globe className="w-3 h-3" /> URL de Destino (POST Request)
                                                        </Label>
                                                        <div className="relative group/input">
                                                            <Input
                                                                value={integration.config.url || ""}
                                                                onChange={(e) => handleUpdateConfig(integration.id, { url: e.target.value })}
                                                                placeholder="https://webhook.site/..."
                                                                className="bg-black/20 border-white/5 font-mono text-[11px] h-11 pr-10 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all rounded-xl"
                                                            />
                                                            <div className="absolute right-3.5 top-3.5 transition-all">
                                                                <div className={`w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${integration.config.url ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-600 italic">O Ajuri enviará um JSON com os dados do cliente para esta URL.</p>
                                                    </div>
                                                )}

                                                {integration.type === "API_KEY" && (
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] uppercase text-zinc-500 font-black tracking-widest flex items-center gap-2">
                                                            <Key className="w-3 h-3" /> Chave de Acesso (X-API-Key)
                                                        </Label>
                                                        <div className="flex items-center gap-2">
                                                            <code className="flex-1 bg-black/40 p-3 rounded-xl text-[11px] font-mono truncate border border-dashed border-white/5 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                                                                {integration.config.key}
                                                            </code>
                                                            <Button size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-xl border-white/5 bg-zinc-900 group-hover:border-emerald-500/30 transition-all" onClick={() => copyToClipboard(integration.config.key || "")}>
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-600 italic">Use esta chave no cabeçalho das suas requisições REST.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar com Dicas/Docs */}
                <div className="space-y-6">
                    <Card className="bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                        <CardHeader>
                            <CardTitle className="text-amber-500 flex items-center gap-2 text-lg">
                                <Zap className="w-5 h-5" /> Webhooks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Webhooks permitem que você envie dados em tempo real para outras aplicações sempre que um evento ocorrer no Ajuri.
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                <li>Integre com Make (Integromat), n8n.</li>
                                <li>Dispare emails automáticos ou mensagens WhatsApp.</li>
                                <li>Sincronize contatos com Google Sheets.</li>
                            </ul>
                            <Separator className="bg-amber-500/20" />
                            <div className="pt-2">
                                <Button variant="link" className="text-amber-500 h-auto p-0 text-xs gap-1">
                                    Ler Documentação Técnica <Zap className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500/5 border-blue-500/10">
                        <CardHeader>
                            <CardTitle className="text-blue-400 flex items-center gap-2 text-lg">
                                <Key className="w-5 h-5" /> API Keys
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Use chaves de API para permitir que sistemas externos consultem ou modifiquem dados no seu CRM de forma segura.
                            </p>
                            <div className="bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-400">
                                Header: Authorization<br />
                                Value: Bearer YOUR_API_KEY
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
