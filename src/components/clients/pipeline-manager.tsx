"use client";

import { useState, useEffect } from "react";
import { CRMPipeline, CRMStage, DEFAULT_STAGES } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, Pencil, Check, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface PipelineManagerProps {
    pipelines: CRMPipeline[];
    onSave: (pipelines: CRMPipeline[]) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const COLORS = [
    "bg-slate-500", "bg-red-500", "bg-orange-500", "bg-amber-500",
    "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500",
    "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500",
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
    "bg-pink-500", "bg-rose-500"
];

export function PipelineManager({ pipelines, onSave, open, onOpenChange }: PipelineManagerProps) {
    const [localPipelines, setLocalPipelines] = useState<CRMPipeline[]>([]);
    const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);

    // Configurações do pipeline em edição
    const [editName, setEditName] = useState("");
    const [editStages, setEditStages] = useState<CRMStage[]>([]);

    useEffect(() => {
        if (open) {
            setLocalPipelines(JSON.parse(JSON.stringify(pipelines)));
            setEditingPipelineId(null);
        }
    }, [open, pipelines]);

    const handleCreatePipeline = () => {
        const newPipeline: CRMPipeline = {
            id: crypto.randomUUID(),
            name: "Novo Pipeline",
            stages: [
                { id: crypto.randomUUID(), name: "Novo", color: "bg-blue-500" },
                { id: crypto.randomUUID(), name: "Em Andamento", color: "bg-amber-500" },
                { id: crypto.randomUUID(), name: "Concluído", color: "bg-emerald-500" }
            ],
            isDefault: false
        };
        const updated = [...localPipelines, newPipeline];
        setLocalPipelines(updated);
        startEditing(newPipeline);
    };

    const handleDeletePipeline = (id: string) => {
        const pipeline = localPipelines.find(p => p.id === id);
        if (pipeline?.isDefault) {
            toast.error("Não é possível excluir o pipeline padrão.");
            return;
        }
        if (confirm("Tem certeza? Todos os leads deste pipeline ficarão órfãos ou precisarão ser migrados.")) {
            setLocalPipelines(localPipelines.filter(p => p.id !== id));
            if (editingPipelineId === id) setEditingPipelineId(null);
        }
    };

    const startEditing = (pipeline: CRMPipeline) => {
        setEditingPipelineId(pipeline.id);
        setEditName(pipeline.name);
        setEditStages(JSON.parse(JSON.stringify(pipeline.stages))); // Deep copy
    };

    const saveEditing = () => {
        if (!editName.trim()) {
            toast.error("O nome do pipeline não pode ser vazio.");
            return;
        }
        if (editStages.length === 0) {
            toast.error("O pipeline precisa ter pelo menos uma etapa.");
            return;
        }

        const updated = localPipelines.map(p =>
            p.id === editingPipelineId
                ? { ...p, name: editName, stages: editStages }
                : p
        );
        setLocalPipelines(updated);
        setEditingPipelineId(null);
        toast.success("Alterações salvas temporariamente.");
    };

    const handleFinalSave = () => {
        let pipelinesToSave = [...localPipelines];

        // Se houver uma edição ativa, aplicar as mudanças antes de salvar tudo
        if (editingPipelineId) {
            if (!editName.trim()) {
                toast.error("O nome do pipeline não pode ser vazio.");
                return;
            }
            if (editStages.length === 0) {
                toast.error("O pipeline precisa ter pelo menos uma etapa.");
                return;
            }

            pipelinesToSave = pipelinesToSave.map(p =>
                p.id === editingPipelineId
                    ? { ...p, name: editName, stages: editStages }
                    : p
            );
        }

        onSave(pipelinesToSave);
        onOpenChange(false);
        toast.success("Todos os pipelines foram salvos!");
    };

    // Stage Management
    const addStage = () => {
        const newStage: CRMStage = {
            id: crypto.randomUUID(),
            name: "Nova Etapa",
            color: "bg-slate-500"
        };
        setEditStages([...editStages, newStage]);
    };

    const removeStage = (id: string) => {
        setEditStages(editStages.filter(s => s.id !== id));
    };

    const updateStage = (id: string, field: keyof CRMStage, value: string) => {
        setEditStages(editStages.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
                <DialogHeader className="p-6 border-b pb-4">
                    <DialogTitle>Gerenciar Pipelines</DialogTitle>
                    <DialogDescription>
                        Crie e customize seus funis de vendas. Organize as etapas de acordo com seu processo.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar: List of Pipelines */}
                    <div className="w-full md:w-1/3 h-[30%] md:h-auto border-b md:border-b-0 md:border-r bg-muted/10 flex flex-col">
                        <div className="p-4 border-b">
                            <Button onClick={handleCreatePipeline} className="w-full gap-2" variant="outline" size="sm">
                                <Plus className="w-4 h-4" /> Novo Pipeline
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {localPipelines.map(pipeline => (
                                    <div
                                        key={pipeline.id}
                                        onClick={() => startEditing(pipeline)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${editingPipelineId === pipeline.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <span className="font-medium text-sm truncate">{pipeline.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{pipeline.stages.length} etapas</span>
                                        </div>
                                        {!pipeline.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePipeline(pipeline.id);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content: Pipeline Editor */}
                    <div className="flex-1 flex flex-col bg-card">
                        {editingPipelineId ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-6 border-b space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Pipeline</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Ex: Prospecção, Onboarding..."
                                            />
                                            <Button onClick={saveEditing} size="icon" className="shrink-0 bg-emerald-600 hover:bg-emerald-700">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold">Etapas do Funil</h3>
                                            <Button onClick={addStage} variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary">
                                                <Plus className="w-3 h-3" /> Adicionar Etapa
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {editStages.map((stage, index) => (
                                                <div key={stage.id} className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg group">
                                                    <div className="cursor-move text-muted-foreground/30 hover:text-muted-foreground">
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full shrink-0 ${stage.color}`} />

                                                    <div className="flex-1 space-y-1">
                                                        <Input
                                                            value={stage.name}
                                                            onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                                                            className="h-7 text-sm border-transparent hover:border-border focu:border-primary bg-transparent p-0 px-2"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <DropdownColor
                                                            currentColor={stage.color}
                                                            onChange={(color) => updateStage(stage.id, "color", color)}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeStage(stage.id)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2 opacity-50">
                                <Pencil className="w-10 h-10" />
                                <p>Selecione um pipeline para editar</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/10">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleFinalSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DropdownColor({ currentColor, onChange }: { currentColor: string, onChange: (c: string) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full p-0 border border-transparent hover:border-border"
                onClick={() => setOpen(!open)}
            >
                <div className={`w-3 h-3 rounded-full ${currentColor}`} />
            </Button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-32 p-2 bg-popover border rounded-lg shadow-lg grid grid-cols-4 gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                className={`w-5 h-5 rounded-full ${c} hover:scale-110 transition-transform ${c === currentColor ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                                onClick={() => {
                                    onChange(c);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
