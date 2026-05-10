export type ProcessStatus = "ATIVO" | "URGENTE" | "SUSPENSO" | "FINALIZADO";

export interface LegalProcess {
    id: string;
    number: string;
    title: string;
    clientName: string;
    clientId?: string;
    status: ProcessStatus;
    progress: number;
    step: string;
    lastMove: string;
    createdAt: string;
    updatedAt: string;
}

export const PROCESS_STATUS_CONFIG = {
    ATIVO: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    URGENTE: { label: "Urgente", color: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" },
    SUSPENSO: { label: "Suspenso", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
    FINALIZADO: { label: "Finalizado", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
};
