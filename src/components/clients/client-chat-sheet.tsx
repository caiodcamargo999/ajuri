"use client";

import { useEffect, useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CRMClient, CRMActivity } from "@/types/crm";
import { evolutionService } from "@/utils/evolution";
import { Send, Loader2, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ClientChatSheetProps {
    client: CRMClient | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateClient: (client: CRMClient) => void;
}

export function ClientChatSheet({ client, open, onOpenChange, onUpdateClient }: ClientChatSheetProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
    const [instances, setInstances] = useState<{ id: string, name: string, instanceName: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            try {
                const profilesStr = localStorage.getItem("ajuri_branding_profiles");
                const activeId = localStorage.getItem("ajuri_active_profile_id");

                if (profilesStr) {
                    const profiles = JSON.parse(profilesStr);
                    const validInstances = profiles
                        .filter((p: any) => p.officeData?.waInstanceName)
                        .map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            instanceName: p.officeData.waInstanceName
                        }));

                    setInstances(validInstances);

                    // Default to active profile or first available
                    if (activeId) {
                        const active = validInstances.find((i: any) => i.id === activeId);
                        if (active) setSelectedInstance(active.instanceName);
                        else if (validInstances.length > 0) setSelectedInstance(validInstances[0].instanceName);
                    } else if (validInstances.length > 0) {
                        setSelectedInstance(validInstances[0].instanceName);
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar instâncias WA:", e);
            }
        }
    }, [open]);

    // Filter only WhatsApp related activities or system messages
    const messages = (client?.activities || [])
        .filter(a => a.type === "WHATSAPP" || a.type === "SYSTEM")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    useEffect(() => {
        if (open && scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [open, messages.length]);

    const handleSendMessage = async () => {
        if (!client || !message.trim()) return;

        if (!client.phone) {
            toast.error("O cliente não possui telefone cadastrado.");
            return;
        }

        if (!selectedInstance) {
            toast.error("Selecione uma conta do WhatsApp para enviar.");
            return;
        }

        setSending(true);
        try {
            // Send via Evolution API
            await evolutionService.sendMessage(client.phone, message, { instanceName: selectedInstance });

            // Add to client activities
            const newActivity: CRMActivity = {
                id: crypto.randomUUID(),
                type: "WHATSAPP",
                content: message,
                timestamp: new Date().toISOString(),
                author: "Você"
            };

            const updatedClient = {
                ...client,
                activities: [...(client.activities || []), newActivity],
                lastUpdate: new Date().toISOString()
            };

            onUpdateClient(updatedClient);
            setMessage("");
            toast.success("Mensagem enviada!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem via WhatsApp.");
        } finally {
            setSending(false);
        }
    };

    if (!client) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-zinc-950 border-l border-white/10">
                <SheetHeader className="p-4 border-b border-white/10 bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-emerald-500/20">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
                                {client.name}
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">WinZap</Badge>
                            </SheetTitle>
                            <SheetDescription className="text-xs text-zinc-400 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {client.phone || "Sem telefone"}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 p-4 bg-zinc-950/50">
                    <div className="space-y-4 pb-4">
                        {!client.phone && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Este cliente não possui número de telefone cadastrado para o WhatsApp.
                            </div>
                        )}

                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-zinc-600 text-xs">
                                Nenhuma mensagem trocada ainda.
                                <br /> Inicie a conversa abaixo.
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.author === "Você" || msg.type === "WHATSAPP" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.author === "Você" || msg.type === "WHATSAPP"
                                            ? "bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20"
                                            : "bg-zinc-800 text-zinc-300 rounded-tl-none border border-white/5"
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="text-[10px] opacity-50 block mt-1 text-right">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <SheetFooter className="p-4 bg-zinc-900 border-t border-white/10 sm:justify-start flex-col gap-3 items-stretch">
                    {instances.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Enviando como:</span>
                            <select
                                value={selectedInstance || ""}
                                onChange={(e) => setSelectedInstance(e.target.value)}
                                className="bg-transparent text-xs text-emerald-500 font-bold border-none outline-none cursor-pointer hover:underline"
                            >
                                {instances.map(i => (
                                    <option key={i.id} value={i.instanceName} className="bg-zinc-900 text-white">
                                        {i.name} ({i.instanceName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex w-full items-center gap-2">
                        <Input
                            placeholder="Digite sua mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                            disabled={sending || !client.phone}
                            className="bg-black/20 border-white/10 focus:ring-emerald-500/50"
                        />
                        <Button
                            size="icon"
                            onClick={handleSendMessage}
                            disabled={sending || !message.trim() || !client.phone}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 shrink-0"
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet >
    );
}
