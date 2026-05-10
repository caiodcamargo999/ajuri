"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LegalProcess, ProcessStatus } from "@/types/process";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
    number: z.string().min(5, "Número do processo é obrigatório"),
    title: z.string().min(3, "Título/Ação é obrigatório"),
    clientName: z.string().min(2, "Nome do cliente é obrigatório"),
    status: z.enum(["ATIVO", "URGENTE", "SUSPENSO", "FINALIZADO"]),
    step: z.string().min(1, "Fase atual é obrigatória"),
    progress: z.number().min(0).max(100),
});

interface ProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (process: LegalProcess) => void;
    editingProcess?: LegalProcess | null;
}

export function ProcessModal({ isOpen, onClose, onSave, editingProcess }: ProcessModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: "",
            title: "",
            clientName: "",
            status: "ATIVO",
            step: "Petição Inicial",
            progress: 10,
        },
    });

    useEffect(() => {
        if (editingProcess) {
            form.reset({
                number: editingProcess.number,
                title: editingProcess.title,
                clientName: editingProcess.clientName,
                status: editingProcess.status,
                step: editingProcess.step,
                progress: editingProcess.progress,
            });
        } else {
            form.reset({
                number: "",
                title: "",
                clientName: "",
                status: "ATIVO",
                step: "Petição Inicial",
                progress: 10,
            });
        }
    }, [editingProcess, form, isOpen]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const processData: LegalProcess = {
            id: editingProcess?.id || crypto.randomUUID(),
            ...values,
            lastMove: "Atualizado recentemente",
            createdAt: editingProcess?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        onSave(processData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{editingProcess ? "Editar Processo" : "Novo Processo"}</DialogTitle>
                    <DialogDescription>
                        Cadastre ou atualize as informações processuais para acompanhamento.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número do Processo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0000000-00.2024.8.04.0001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ação / Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Indenização por Danos Morais" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do autor ou réu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ATIVO">Ativo</SelectItem>
                                                <SelectItem value="URGENTE">Urgente</SelectItem>
                                                <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                                                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="step"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fase Atual</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Saneamento" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="progress"
                            render={({ field }) => (
                                <FormItem className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Progresso do Caso</FormLabel>
                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{field.value}%</span>
                                    </div>
                                    <FormControl>
                                        <Slider
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={[field.value]}
                                            onValueChange={(vals) => field.onChange(vals[0])}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button type="submit" className="rounded-xl px-8">
                                {editingProcess ? "Salvar Alterações" : "Cadastrar Processo"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
