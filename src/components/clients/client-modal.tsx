"use client"

import { useState, useEffect } from "react";
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
    FormDescription
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CRMClient, ClientStatus, CRMActivity, CRMTask } from "@/types/crm";
import { User, Mail, Phone, MapPin, FileType, History, MessageSquare, Send, Calendar, Clock, MoreVertical, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { evolutionService } from "@/utils/evolution";

const formSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido").or(z.literal("")),
    phone: z.string().min(8, "Telefone inválido").or(z.literal("")),
    status: z.enum(["NOVO", "QUALIFICACAO", "APRESENTACAO", "NEGOCIACAO", "FECHADO", "PERDIDO", "ARQUIVADO"]),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    nacionalidade: z.string().optional(),
    estadoCivil: z.string().optional(),
    profissao: z.string().optional(),
    address: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    notes: z.string().optional(),
    value: z.coerce.number().optional(),
});

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: CRMClient) => void;
    onDelete?: (id: string) => void;
    editingClient?: CRMClient | null;
}

type TabType = "TIMELINE" | "WHATSAPP" | "TASKS";

export function ClientModal({ isOpen, onClose, onSave, onDelete, editingClient }: ClientModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>("TIMELINE");
    const [noteInput, setNoteInput] = useState("");
    const [isSendingWA, setIsSendingWA] = useState(false);
    const [activities, setActivities] = useState<CRMActivity[]>([]);
    const [tasks, setTasks] = useState<CRMTask[]>([]);
    const [waInstance, setWaInstance] = useState<string | null>(null);
    const [inputType, setInputType] = useState<"NOTE" | "WHATSAPP" | "TASK">("NOTE");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            status: "NOVO",
            cpf: "",
            rg: "",
            nacionalidade: "",
            estadoCivil: "",
            profissao: "",
            address: "",
            bairro: "",
            cep: "",
            notes: "",
            value: 0,
        },
    });

    useEffect(() => {
        // Load active WhatsApp instance from branding settings
        try {
            const profilesStr = localStorage.getItem("ajuri_branding_profiles");
            const activeId = localStorage.getItem("ajuri_active_profile_id");
            if (profilesStr && activeId) {
                const profiles = JSON.parse(profilesStr);
                const active = profiles.find((p: any) => p.id === activeId);
                if (active?.officeData?.waInstanceName) {
                    setWaInstance(active.officeData.waInstanceName);
                }
            }
        } catch (e) {
            console.error("Erro ao carregar instância WA:", e);
        }

        if (editingClient) {
            form.reset({
                name: editingClient.name,
                email: editingClient.email,
                phone: editingClient.phone,
                status: editingClient.status as any,
                cpf: editingClient.cpf || "",
                rg: editingClient.rg || "",
                nacionalidade: editingClient.nacionalidade || "",
                estadoCivil: editingClient.estadoCivil || "",
                profissao: editingClient.profissao || "",
                address: editingClient.address || "",
                bairro: editingClient.bairro || "",
                cep: editingClient.cep || "",
                notes: editingClient.notes || "",
                value: editingClient.value || 0,
            });
            setActivities(editingClient.activities || []);
            setTasks(editingClient.tasks || []);
            setTags(editingClient.tags || []);
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
                status: "NOVO",
                cpf: "",
                rg: "",
                nacionalidade: "",
                estadoCivil: "",
                profissao: "",
                address: "",
                bairro: "",
                cep: "",
                notes: "",
                value: 0,
            });
            setActivities([]);
            setTasks([]);
            setTags([]);
        }
        setActiveTab("TIMELINE");
        setNoteInput("");
    }, [editingClient, form, isOpen]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const clientData: CRMClient = {
            id: editingClient?.id || crypto.randomUUID(),
            ...values,
            email: values.email || "",
            phone: values.phone || "",
            createdAt: editingClient?.createdAt || new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            processCount: editingClient?.processCount || 0,
            activities: activities,
            tasks: tasks,
            tags: tags,
        };
        onSave(clientData);
        onClose();
    };

    const handleAddNote = () => {
        if (!noteInput.trim()) return;

        if (inputType === "TASK") {
            const newTask: CRMTask = {
                id: crypto.randomUUID(),
                title: noteInput,
                dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow by default
                status: "PENDING",
                priority: "MEDIUM"
            };
            setTasks([newTask, ...tasks]);
            setNoteInput("");
            toast.success("Tarefa agendada!");
            return;
        }

        const newActivity: CRMActivity = {
            id: crypto.randomUUID(),
            type: inputType === "WHATSAPP" ? "WHATSAPP" : "NOTE",
            content: noteInput,
            timestamp: new Date().toISOString(),
            author: "Você"
        };

        const updatedActivities = [newActivity, ...activities];
        setActivities(updatedActivities);
        setNoteInput("");

        if (inputType === "WHATSAPP") {
            handleSendWhatsApp(noteInput);
        } else {
            toast.success("Nota adicionada ao histórico!");
        }
    };

    const handleSendWhatsApp = async (text: string) => {
        if (!editingClient?.phone) {
            toast.error("Cliente sem telefone cadastrado.");
            return;
        }

        if (!waInstance) {
            toast.error("Você não tem nenhuma instância do WhatsApp conectada. Vá em 'Customizar Documentação' para configurar.");
            return;
        }

        setIsSendingWA(true);
        try {
            await evolutionService.sendMessage(editingClient.phone, text, { instanceName: waInstance });
            toast.success("Mensagem enviada via WhatsApp!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar WhatsApp. Verifique a integração.");
        } finally {
            setIsSendingWA(false);
        }
    };

    const handleDelete = () => {
        if (editingClient && onDelete) {
            if (confirm(`Tem certeza que deseja excluir o lead ${editingClient.name}?`)) {
                onDelete(editingClient.id);
                onClose();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border/40 font-inter">

                {/* Header Estilo Kommo */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold leading-none">{editingClient?.name || "Novo Lead"}</h2>
                                {editingClient?.value && editingClient.value > 0 && (
                                    <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                        R$ {editingClient.value.toLocaleString()}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-wider h-4 bg-primary/10 text-primary border-none">
                                    {editingClient?.status || "NOVO"}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {editingClient ? `Atualizado em ${new Date(editingClient.lastUpdate).toLocaleDateString()}` : "Novo agora"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {editingClient && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-xl h-8 px-4" onClick={form.handleSubmit(onSubmit)}>
                            Salvar Tudo
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Coluna Esquerda: Dados e Campos (30%) */}
                    <div className="w-[30%] border-r overflow-y-auto p-5 bg-muted/5 space-y-6">
                        <Form {...form}>
                            <form className="space-y-6">
                                <div className="space-y-4 text-sm font-medium">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Dados de Contato</h3>

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Nome completo</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: João Silva" className="bg-background h-9 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">WhatsApp</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="(00) 00000-0000" className="bg-background h-9 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@exemplo.com" className="bg-background h-9 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="cpf"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[11px] text-muted-foreground">CPF</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="000.000.000-00" className="bg-background h-9 text-[11px]" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rg"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[11px] text-muted-foreground">RG</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="RG" className="bg-background h-9 text-[11px]" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="estadoCivil"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Estado Civil</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background h-9 text-xs">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                                                        <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                                                        <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                                                        <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                                                        <SelectItem value="União Estável">União Estável</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="profissao"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Profissão</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Advogado" className="bg-background h-9 text-xs" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Endereço</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Rua, número..." className="bg-background h-9 text-xs" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Tags</h3>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nova tag..."
                                                className="bg-background h-9 text-xs"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                            setTags([...tags, tagInput.trim()]);
                                                            setTagInput("");
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3"
                                                onClick={() => {
                                                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                        setTags([...tags, tagInput.trim()]);
                                                        setTagInput("");
                                                    }
                                                }}
                                            >
                                                <PlusCircle className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-[10px] py-0 px-2 flex items-center gap-1 group bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                                                >
                                                    {tag}
                                                    <X
                                                        className="w-2.5 h-2.5 cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Status e Funil</h3>
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Estágio no Funil</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background h-9 text-xs">
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="NOVO">Novo Lead</SelectItem>
                                                        <SelectItem value="QUALIFICACAO">Qualificação</SelectItem>
                                                        <SelectItem value="APRESENTACAO">Apresentação</SelectItem>
                                                        <SelectItem value="NEGOCIACAO">Negociação</SelectItem>
                                                        <SelectItem value="FECHADO">Fechado 🚀</SelectItem>
                                                        <SelectItem value="PERDIDO">Perdido</SelectItem>
                                                        <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-[11px] text-muted-foreground">Valor do Contrato (R$)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0.00" className="bg-background h-9 text-xs" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Coluna Direita: Timeline / Chat / Atividades (70%) */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        {/* Tabs Estilo Kommo */}
                        <div className="flex items-center gap-6 px-6 border-b h-12 shrink-0">
                            <button
                                onClick={() => setActiveTab("TIMELINE")}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-tighter h-full px-1 border-b-2 transition-all",
                                    activeTab === "TIMELINE" ? "border-primary text-primary" : "border-transparent text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                Timeline e Notas
                            </button>
                            <button
                                onClick={() => setActiveTab("WHATSAPP")}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-tighter h-full px-1 border-b-2 transition-all",
                                    activeTab === "WHATSAPP" ? "border-emerald-500 text-emerald-500" : "border-transparent text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                Chat WhatsApp
                            </button>
                            <button
                                onClick={() => setActiveTab("TASKS")}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-tighter h-full px-1 border-b-2 transition-all",
                                    activeTab === "TASKS" ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                Tarefas
                            </button>
                        </div>

                        {/* Feed Dinâmico */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                            {activeTab === "TIMELINE" && (
                                <>
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                                    activity.type === "NOTE" ? "bg-amber-100 text-amber-600 border-amber-200" :
                                                        activity.type === "WHATSAPP" ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                                                            "bg-blue-100 text-blue-600 border-blue-200"
                                                )}>
                                                    {activity.type === "NOTE" ? <History className="w-4 h-4" /> :
                                                        activity.type === "WHATSAPP" ? <MessageSquare className="w-4 h-4" /> :
                                                            <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[11px] font-bold uppercase text-muted-foreground/80">{activity.type === "NOTE" ? "Nota" : activity.type} • {activity.author || "Sistema"}</p>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(activity.timestamp).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "p-3 rounded-2xl rounded-tl-none text-sm shadow-sm border",
                                                        activity.type === "NOTE" ? "bg-amber-50 border-amber-200 text-zinc-900" : "bg-white border-border/40 text-zinc-900"
                                                    )}>
                                                        {activity.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
                                            <div className="p-6 rounded-full bg-muted/20">
                                                <History className="w-12 h-12 text-muted-foreground/40" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Sem histórico recente</p>
                                                <p className="text-xs text-muted-foreground">Inicie uma conversa ou adicione uma nota para registrar atividades.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "WHATSAPP" && (
                                <div className="flex flex-col h-full gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800">
                                        <div className="p-2 bg-emerald-100 rounded-xl">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold leading-none">Integração WhatsApp Ativa</p>
                                            <p className="text-[10px] opacity-70">Enviando via Evolution API: {editingClient?.phone || "Nenhum número"}</p>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    <div className="flex-1 space-y-4 opacity-60">
                                        {activities.filter(a => a.type === "WHATSAPP").length > 0 ? (
                                            activities.filter(a => a.type === "WHATSAPP").map(a => (
                                                <div key={a.id} className="flex flex-col items-end gap-1">
                                                    <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-lg">
                                                        {a.content}
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                                                <p className="text-xs">Nenhuma mensagem enviada por aqui ainda.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "TASKS" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold">Tarefas Pendentes</h3>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[10px] uppercase font-bold rounded-lg gap-1 border-amber-200 text-amber-600 hover:bg-amber-50"
                                            onClick={() => {
                                                setActiveTab("TASKS");
                                                setInputType("TASK");
                                            }}
                                        >
                                            <PlusCircle className="w-3 h-3" /> Nova Tarefa
                                        </Button>
                                    </div>
                                    {tasks.length > 0 ? (
                                        tasks.map(task => (
                                            <div key={task.id} className="p-3 bg-white border border-border/40 rounded-xl flex items-center gap-3 shadow-sm hover:border-amber-200 transition-colors cursor-pointer group">
                                                <div className="w-5 h-5 rounded-md border-2 border-muted hover:border-amber-500 transition-colors group-hover:bg-amber-50" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold">{task.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Calendar className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[10px] text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                        <Badge variant="outline" className="text-[8px] h-3.5 bg-amber-50 text-amber-700 border-amber-100 uppercase">{task.priority}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-amber-50/30 rounded-3xl border-2 border-dashed border-amber-200/50">
                                            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-amber-300" />
                                            <p className="text-xs font-bold text-amber-700">Nenhuma tarefa agendada</p>
                                            <p className="text-[10px] text-amber-600/60 mt-1">Crie tarefas para não perder prazos com este lead.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input de Mensagem/Nota Estilo Kommo na Base */}
                        <div className="p-5 border-t bg-background shrink-0">
                            <div className="flex gap-2 items-center bg-zinc-50 border rounded-2xl p-1.5 focus-within:ring-2 ring-primary/20 focus-within:bg-white transition-all shadow-sm">
                                <Select value={inputType} onValueChange={(v: any) => setInputType(v)}>
                                    <SelectTrigger className="w-[100px] border-none bg-transparent h-9 text-[10px] font-bold uppercase focus:ring-0 shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="NOTE" className="text-[10px] font-bold uppercase focus:bg-primary/10">Nota</SelectItem>
                                        <SelectItem value="WHATSAPP" className="text-[10px] font-bold uppercase focus:bg-emerald-500/10">WhatsApp</SelectItem>
                                        <SelectItem value="TASK" className="text-[10px] font-bold uppercase focus:bg-amber-500/10">Tarefa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder={inputType === "WHATSAPP" ? "Enviar mensagem via WhatsApp..." : inputType === "TASK" ? "Título da nova tarefa (Enter para agendar)..." : "Escrever uma nota interna..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-10 py-2 font-medium"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddNote();
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleAddNote}
                                    disabled={!noteInput.trim() || isSendingWA}
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-xl transition-all shadow-md",
                                        inputType === "WHATSAPP" ? "bg-emerald-600 hover:bg-emerald-700" :
                                            inputType === "TASK" ? "bg-amber-500 hover:bg-amber-600" :
                                                "bg-primary hover:bg-primary/90"
                                    )}
                                >
                                    {isSendingWA ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 px-1">
                                Pressione <kbd className="font-sans font-bold">Enter</kbd> para enviar. Use notas para registros internos e WhatsApp para falar com o cliente.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const PlusCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
);
