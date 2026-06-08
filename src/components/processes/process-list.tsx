"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, AlertCircle, MoreVertical, Edit2 } from "lucide-react"
import { LegalProcess, PROCESS_STATUS_CONFIG } from "@/types/process"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ProcessListProps {
    processes: LegalProcess[];
    onEdit: (process: LegalProcess) => void;
}

export function ProcessList({ processes, onEdit }: ProcessListProps) {
    if (processes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-3xl bg-muted/20 text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">Nenhum processo cadastrado</p>
                    <p className="text-sm text-muted-foreground">Clique em "Novo Processo" para começar o acompanhamento.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {processes.map(proc => (
                <Card key={proc.id} className="group hover:shadow-lg transition-all border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className="font-mono text-[10px] bg-background">
                                {proc.number}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <Badge className={cn("rounded-full px-2.5 font-normal border shadow-none", PROCESS_STATUS_CONFIG[proc.status].color)}>
                                    {PROCESS_STATUS_CONFIG[proc.status].label}
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                        <MoreVertical className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={() => onEdit(proc)} className="gap-2 cursor-pointer">
                                            <Edit2 className="h-3.5 w-3.5" /> Editar Detalhes
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                            {proc.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-foreground/70">
                            {proc.clientName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                                <span>{proc.step}</span>
                                <span>{proc.progress}%</span>
                            </div>
                            <Progress value={proc.progress} className="h-2 rounded-full" />
                        </div>

                        <div className="flex gap-2 items-center text-xs bg-muted/50 p-3 rounded-xl border border-border/30 text-muted-foreground mt-auto">
                            {proc.status === 'URGENTE' ? (
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive animate-pulse" />
                            ) : (
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span className="truncate">{proc.lastMove}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
