"use client";

import { CRMClient, STATUS_COLUMNS, ClientStatus } from "@/types/crm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Mail, Phone, Calendar, Plus, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanViewProps {
    clients: CRMClient[];
    columns?: { id: ClientStatus; title: string; color: string }[];
    onEditClient: (client: CRMClient) => void;
    onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
    onDeleteClient: (clientId: string) => void;
    onCreateClient?: (status: ClientStatus) => void;
    onChat?: (client: CRMClient) => void;
    selectedClients?: string[];
    onToggleSelection?: (clientId: string) => void;
}

export function KanbanView({
    clients,
    columns = STATUS_COLUMNS,
    onEditClient,
    onMoveClient,
    onDeleteClient,
    onCreateClient,
    onChat,
    selectedClients = [],
    onToggleSelection
}: KanbanViewProps) {
    const getClientsByStatus = (status: ClientStatus) => {
        return clients.filter((c) => c.status === status);
    };

    const handleDragStart = (e: React.DragEvent, clientId: string) => {
        e.dataTransfer.setData("clientId", clientId);
    };

    const handleDrop = (e: React.DragEvent, status: ClientStatus) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData("clientId");
        onMoveClient(clientId, status);
    };

    const allowDrop = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px] px-10 snap-x w-full min-w-0">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex flex-col w-80 shrink-0 gap-4"
                    onDragOver={allowDrop}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", column.color)} />
                            <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
                            <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
                                {getClientsByStatus(column.id).length}
                            </Badge>
                        </div>
                        {onCreateClient && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-muted"
                                onClick={() => onCreateClient(column.id)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 h-full rounded-2xl bg-muted/30 p-2 border border-border/50">
                        {getClientsByStatus(column.id).map((client) => {
                            const isSelected = selectedClients.includes(client.id);
                            return (
                                <motion.div
                                    key={client.id}
                                    layoutId={client.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e as any, client.id)}
                                    className="cursor-grab active:cursor-grabbing relative"
                                >
                                    <Card
                                        className={cn(
                                            "p-4 hover:shadow-md transition-all border-border/50 bg-card group",
                                            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary/50"
                                        )}
                                        onClick={() => onEditClient(client)}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="relative"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleSelection?.(client.id);
                                                        }}
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer",
                                                            isSelected ? "bg-primary border-primary" : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                                                        )}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                        </div>
                                                    </div>
                                                    <Avatar className="h-8 w-8 border">
                                                        <AvatarImage src={client.avatar} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {client.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-sm truncate max-w-[140px]">{client.name}</span>
                                                </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md h-7 w-7 opacity-0 group-hover:opacity-100 p-0 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-48">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => onEditClient(client)}>Editar Cliente</DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => onEditClient(client)}>Ver Histórico</DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer rounded-lg text-primary" onClick={() => {
                                                            // TODO: Redirecionar para criação de processo
                                                            onEditClient(client);
                                                        }}>Novo Processo</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                if (confirm(`Tem certeza que deseja excluir o lead ${client.name}?`)) {
                                                                    onDeleteClient(client.id);
                                                                }
                                                            }}
                                                        >
                                                            Excluir Lead
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 px-0.5">
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {client.tags && client.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 px-0.5">
                                                {client.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-[9px] py-0 px-1.5 h-4 bg-zinc-50 border-zinc-200 text-zinc-500 font-medium">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-border/30">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(client.lastUpdate).toLocaleDateString()}</span>
                                            </div>
                                            {client.processCount > 0 && (
                                                <Badge variant="outline" className="text-[9px] h-4">
                                                    {client.processCount} Processos
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            {onChat && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-[10px] gap-1 hover:bg-emerald-500/10 hover:text-emerald-500 w-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onChat(client);
                                                    }}
                                                >
                                                    <MessageCircle className="h-3 w-3" />
                                                    WhatsApp
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )})}

                        {getClientsByStatus(column.id).length === 0 && (
                            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border/30 rounded-xl text-muted-foreground/40 text-xs">
                                Vazio
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
