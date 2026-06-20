"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CRMClient } from "@/types/crm"

interface ClientListProps {
    clients: CRMClient[];
    stages?: { id: string; name: string; color: string }[];
    onEdit: (client: CRMClient) => void;
    onChat: (client: CRMClient) => void;
    onDelete: (clientId: string) => void;
    selectedClients: string[];
    onToggleSelection: (clientId: string) => void;
}

export function ClientList({ 
    clients, 
    stages, 
    onEdit, 
    onChat, 
    onDelete,
    selectedClients, 
    onToggleSelection 
}: ClientListProps) {
    const allSelected = clients.length > 0 && selectedClients.length === clients.length;
    
    const handleSelectAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (allSelected) {
            clients.forEach(c => {
                if (selectedClients.includes(c.id)) onToggleSelection(c.id);
            });
        } else {
            clients.forEach(c => {
                if (!selectedClients.includes(c.id)) onToggleSelection(c.id);
            });
        }
    };
    const getStageConfig = (status: string) => {
        if (stages) {
            const found = stages.find(s => s.id === status);
            if (found) return found;
        }
        // Fallback for default statuses if stages not provided or not found (legacy)
        switch (status) {
            case "NOVO": return { name: "Novo Lead", color: "bg-blue-500" };
            case "QUALIFICACAO": return { name: "Qualificação", color: "bg-indigo-500" };
            case "APRESENTACAO": return { name: "Apresentação", color: "bg-purple-500" };
            case "NEGOCIACAO": return { name: "Negociação", color: "bg-amber-500" };
            case "FECHADO": return { name: "Fechado 🚀", color: "bg-emerald-500" };
            default: return { name: status, color: "bg-slate-500" };
        }
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10">
                            <div 
                                className={cn(
                                    "w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer",
                                    allSelected ? "bg-primary border-primary" : "border-zinc-700 bg-zinc-900"
                                )}
                                onClick={handleSelectAll}
                            >
                                {allSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                        </TableHead>
                        <TableHead className="w-[300px]">Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processos</TableHead>
                        <TableHead>Última Atualização</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Nenhum cliente encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => {
                            const stage = getStageConfig(client.status);
                            const colorClass = stage.color.replace("bg-", "text-").replace("500", "600");
                            const bgClass = stage.color + "/10";
                            const isSelected = selectedClients.includes(client.id);

                            return (
                                <TableRow
                                    key={client.id}
                                    className={cn(
                                        "hover:bg-muted/50 transition-colors cursor-pointer",
                                        isSelected && "bg-primary/5"
                                    )}
                                    onClick={() => onEdit(client)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <div 
                                            className={cn(
                                                "w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer",
                                                isSelected ? "bg-primary border-primary" : "border-zinc-700 bg-zinc-900"
                                            )}
                                            onClick={() => onToggleSelection(client.id)}
                                        >
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border text-xs">
                                                <AvatarImage src={client.avatar} alt={client.name} />
                                                <AvatarFallback className="bg-primary/5 text-primary">
                                                    {client.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{client.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{client.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-full px-2.5 font-normal text-[10px] uppercase tracking-wider border-transparent",
                                                bgClass,
                                                colorClass
                                            )}
                                        >
                                            {stage.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span>{client.processCount}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(client.lastUpdate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-full h-8 w-8 p-0 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-200">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                </DropdownMenuGroup>
                                                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => onEdit(client)}>Editar Cliente</DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => onEdit(client)}>Ver Histórico</DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer rounded-lg text-primary" onClick={() => {
                                                    // TODO: Redirecionar para criação de processo
                                                    onEdit(client);
                                                }}>Novo Processo</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`Tem certeza que deseja excluir o lead ${client.name}?`)) {
                                                            onDelete(client.id);
                                                        }
                                                    }}
                                                >
                                                    Excluir Lead
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
