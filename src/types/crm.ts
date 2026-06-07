export type ClientStatus =
    | "NOVO"
    | "QUALIFICACAO"
    | "APRESENTACAO"
    | "NEGOCIACAO"
    | "FECHADO"
    | "PERDIDO"
    | "ARQUIVADO"
    | string;

export interface CRMStage {
    id: string;
    name: string;
    color: string;
}

export interface CRMPipeline {
    id: string;
    name: string;
    stages: CRMStage[];
    isDefault?: boolean;
}

export type CRMEvent = "CLIENT_CREATED" | "CLIENT_UPDATED" | "STATUS_CHANGED";

export const CRM_EVENTS: { id: CRMEvent; label: string }[] = [
    { id: "CLIENT_CREATED", label: "Novo Lead Criado" },
    { id: "CLIENT_UPDATED", label: "Lead Atualizado" },
    { id: "STATUS_CHANGED", label: "Status Alterado" },
];

export interface CRMIntegration {
    id: string;
    name: string;
    type: "WEBHOOK" | "API_KEY";
    config: {
        url?: string;
        key?: string;
        events: CRMEvent[];
    };
    active: boolean;
}

export interface CRMActivity {
    id: string;
    type: "NOTE" | "CALL" | "WHATSAPP" | "EMAIL" | "SYSTEM";
    content: string;
    timestamp: string;
    author?: string;
    audioUrl?: string;
}

export interface CRMTask {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    createdAt?: string;
    assignee?: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "PENDING" | "COMPLETED";
    priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface CRMClient {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: ClientStatus;
    pipelineId?: string; // Optional for backward compatibility (default pipeline)
    avatar?: string;
    cpf?: string;
    rg?: string;
    nacionalidade?: string;
    estadoCivil?: string;
    profissao?: string;
    address?: string;
    bairro?: string;
    cep?: string;
    notes?: string;
    createdAt: string;
    lastUpdate: string;
    processCount: number;
    activities: CRMActivity[];
    tasks: CRMTask[];
    value?: number; // Estimated contract value
    tags: string[];
}

export const DEFAULT_STAGES: CRMStage[] = [
    { id: "NOVO", name: "Novo Lead", color: "bg-blue-500" },
    { id: "QUALIFICACAO", name: "Qualificação", color: "bg-indigo-500" },
    { id: "APRESENTACAO", name: "Apresentação", color: "bg-purple-500" },
    { id: "NEGOCIACAO", name: "Negociação", color: "bg-amber-500" },
    { id: "FECHADO", name: "Fechado 🚀", color: "bg-emerald-500" },
    { id: "PERDIDO", name: "Perdido", color: "bg-rose-500" },
];

export const STATUS_COLUMNS = DEFAULT_STAGES.map(s => ({
    id: s.id as ClientStatus,
    title: s.name,
    color: s.color
}));
