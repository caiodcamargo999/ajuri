"use client"

import { useState, useEffect, useRef } from "react";
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
import { User, Mail, Phone, MapPin, FileType, History, MessageSquare, Send, Calendar, Clock, MoreVertical, Trash2, CheckCircle2, AlertCircle, X, Mic, Square, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { evolutionService } from "@/utils/evolution";
import { formatCPF, isValidCPF } from "@/utils/formatters";

const formSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido").or(z.literal("")),
    phone: z.string().min(8, "Telefone inválido").or(z.literal("")),
    status: z.enum(["NOVO", "QUALIFICACAO", "APRESENTACAO", "NEGOCIACAO", "FECHADO", "PERDIDO", "ARQUIVADO"]),
    cpf: z.string().refine((val) => isValidCPF(val), {
        message: "CPF é obrigatório e deve ser válido"
    }),
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

type TabType = "TIMELINE" | "WHATSAPP" | "TASKS";

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: CRMClient, options?: { closeModal?: boolean, showToast?: boolean }) => void;
    onDelete?: (id: string) => void;
    editingClient?: CRMClient | null;
    initialTab?: TabType;
}

const AudioMessageRenderer = ({ msg, waInstance }: { msg: any, waInstance: string }) => {
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAudio = async () => {
            try {
                const res = await evolutionService.getMediaBase64(msg, { instanceName: waInstance });
                if (res && res.base64) {
                    let b64 = res.base64;
                    if (!b64.startsWith("data:")) {
                        const mimetype = msg.message?.audioMessage?.mimetype || "audio/ogg";
                        b64 = `data:${mimetype};base64,${b64}`;
                    }
                    setAudioUrl(b64);
                }
            } catch (e) {
                console.error("Erro ao carregar áudio:", e);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadAudio();
    }, [msg, waInstance]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 h-10 w-[200px] bg-black/5 dark:bg-white/5 rounded-full px-4 animate-pulse">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                <span className="text-[10px] opacity-70">Carregando áudio...</span>
            </div>
        );
    }

    if (audioUrl) {
        return <audio controls src={audioUrl} className="h-10 max-w-[220px]" />;
    }

    return (
        <div className="flex items-center gap-2 text-red-500 opacity-80">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px]">Áudio indisponível</span>
        </div>
    );
};

export function ClientModal({ isOpen, onClose, onSave, onDelete, editingClient, initialTab }: ClientModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab || "TIMELINE");
    const [noteInput, setNoteInput] = useState("");
    const [isSendingWA, setIsSendingWA] = useState(false);
    const [activities, setActivities] = useState<CRMActivity[]>([]);
    const [tasks, setTasks] = useState<CRMTask[]>([]);
    const [waInstance, setWaInstance] = useState<string | null>(null);
    const [inputType, setInputType] = useState<"NOTE" | "WHATSAPP" | "TASK">("NOTE");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const noteInputRef = useRef<HTMLTextAreaElement>(null);

    const generatedIdRef = useRef<string | null>(null);
    const createdAtRef = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            generatedIdRef.current = editingClient?.id || crypto.randomUUID();
            createdAtRef.current = editingClient?.createdAt || new Date().toISOString();
        }
    }, [isOpen, editingClient]);
    
    // WhatsApp History State
    const [waHistory, setWaHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDate, setNewTaskDate] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskAssignee, setNewTaskAssignee] = useState("");

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskDate, setEditTaskDate] = useState("");
    const [editTaskDescription, setEditTaskDescription] = useState("");
    const [editTaskAssignee, setEditTaskAssignee] = useState("");

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    // Envia a string base64 completa (com o mime type)
                    await handleSendAudio(base64Audio);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecordingAudio(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Erro ao acessar o microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecordingAudio) {
            mediaRecorderRef.current.stop();
            setIsRecordingAudio(false);
        }
    };

    const handleSendAudio = async (base64Audio: string) => {
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
            await evolutionService.sendAudio(editingClient.phone, base64Audio, { instanceName: waInstance });
            toast.success("Áudio enviado via WhatsApp!");
            
            const newActivity: CRMActivity = {
                id: crypto.randomUUID(),
                type: "WHATSAPP",
                content: "🎵 Áudio enviado",
                audioUrl: base64Audio,
                timestamp: new Date().toISOString(),
                author: "Você"
            };
            setActivities([newActivity, ...activities]);
            
            // Reload history to fetch new message from API
            setTimeout(() => {
                loadWaHistory();
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar áudio. Verifique a integração.");
        } finally {
            setIsSendingWA(false);
        }
    };

    const handleSaveNewTask = () => {
        if (!newTaskTitle.trim()) return;

        let dueDateStr = new Date(Date.now() + 86400000).toISOString(); // Amanhã
        if (newTaskDate) {
            // Corrige o fuso horário para a data selecionada ser local
            const [year, month, day] = newTaskDate.split("-").map(Number);
            dueDateStr = new Date(year, month - 1, day, 12, 0, 0).toISOString();
        }

        const task: CRMTask = {
            id: crypto.randomUUID(),
            title: newTaskTitle,
            description: newTaskDescription,
            dueDate: dueDateStr,
            createdAt: new Date().toISOString(),
            assignee: newTaskAssignee || "Não atribuído",
            status: "PENDING",
            priority: "MEDIUM"
        };
        setTasks([task, ...tasks]);
        setNewTaskTitle("");
        setNewTaskDate("");
        setNewTaskDescription("");
        setNewTaskAssignee("");
        setIsCreatingTask(false);
        toast.success("Tarefa agendada!");
    };

    const handleEditTaskClick = (task: CRMTask) => {
        setEditingTaskId(task.id);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description || "");
        setEditTaskDate(task.dueDate ? task.dueDate.split('T')[0] : "");
        setEditTaskAssignee(task.assignee || "");
    };

    const handleSaveEditTask = () => {
        if (!editTaskTitle.trim() || !editingTaskId) return;

        let dueDateStr = new Date(Date.now() + 86400000).toISOString();
        if (editTaskDate) {
            const [year, month, day] = editTaskDate.split("-").map(Number);
            dueDateStr = new Date(year, month - 1, day, 12, 0, 0).toISOString();
        }

        const updatedTasks = tasks.map(task => 
            task.id === editingTaskId ? {
                ...task,
                title: editTaskTitle,
                description: editTaskDescription,
                dueDate: dueDateStr,
                assignee: editTaskAssignee || "Não atribuído"
            } : task
        );
        setTasks(updatedTasks);
        setEditingTaskId(null);
        toast.success("Tarefa atualizada!");
    };

    const handleDeleteTask = (taskId: string) => {
        if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success("Tarefa excluída!");
        }
    };

    const handleChangeTaskStatus = (taskId: string, newStatus: any) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        toast.success("Status atualizado!");
    };

    const loadWaHistory = async (silent = false) => {
        if (!editingClient?.phone || !waInstance) return;
        if (!silent) setIsLoadingHistory(true);
        try {
            const formattedPhone = evolutionService.formatNumber(editingClient.phone);
            const targetJid = `${formattedPhone}@s.whatsapp.net`;
            
            let alternativeJid = "";
            if (formattedPhone.startsWith("55") && formattedPhone.length === 13) {
                const ddd = formattedPhone.substring(2, 4);
                const numberWithout9 = formattedPhone.substring(5);
                alternativeJid = `55${ddd}${numberWithout9}@s.whatsapp.net`;
            }

            // Tenta buscar as mensagens com o JID formatado padrão
            let response = await evolutionService.findMessages(targetJid, { instanceName: waInstance });
            
            const extractMessages = (resp: any) => {
                if (Array.isArray(resp)) return resp;
                if (resp?.messages && Array.isArray(resp.messages.records)) return resp.messages.records;
                if (resp?.records && Array.isArray(resp.records)) return resp.records;
                return [];
            };

            let messages: any[] = extractMessages(response);

            // Se não encontrou nenhuma e existe uma variação de JID (ex: sem o 9º dígito), tenta novamente
            if (messages.length === 0 && alternativeJid) {
                const fallbackResponse = await evolutionService.findMessages(alternativeJid, { instanceName: waInstance });
                messages = extractMessages(fallbackResponse);
            }
            
            // Filtro local super robusto para lidar com @lid, participantAlt e ausência do 9º dígito
            const rawPhone = editingClient.phone.replace(/\D/g, "");
            let rawPhoneAlt = rawPhone;
            if (rawPhone.length === 11) {
                // Remove o 9º dígito
                rawPhoneAlt = rawPhone.substring(0, 2) + rawPhone.substring(3);
            } else if (rawPhone.length === 10) {
                // Adiciona o 9º dígito caso falte
                rawPhoneAlt = rawPhone.substring(0, 2) + "9" + rawPhone.substring(2);
            }

            messages = messages.filter(msg => {
                const keyStr = JSON.stringify(msg.key || {});
                const msgStr = msg.remoteJid || "";
                
                // Verifica se qualquer identificador da mensagem contém o número exato ou a variação sem o 9
                const hasMatch = keyStr.includes(rawPhone) || 
                                 keyStr.includes(rawPhoneAlt) || 
                                 msgStr.includes(rawPhone) || 
                                 msgStr.includes(rawPhoneAlt);
                                 
                return hasMatch;
            });
            
            // Sort by timestamp
            messages = messages.sort((a, b) => {
                const timeA = a.messageTimestamp || 0;
                const timeB = b.messageTimestamp || 0;
                return timeA - timeB;
            });
            
            // Remove duplicates by message ID if any
            const uniqueMessages = [];
            const seenIds = new Set();
            for (const msg of messages) {
                const id = msg.key?.id;
                if (!id || !seenIds.has(id)) {
                    if (id) seenIds.add(id);
                    uniqueMessages.push(msg);
                }
            }
            
            setWaHistory(uniqueMessages);
        } catch (e) {
            console.error("Erro ao carregar histórico do WhatsApp:", e);
        } finally {
            if (!silent) setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTab === "WHATSAPP") {
            loadWaHistory();
            // Polling silently every 5 seconds to get new messages from the contact
            interval = setInterval(() => {
                loadWaHistory(true);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab, editingClient?.phone, waInstance]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
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
    }, [editingClient, form]);

    // Auto-save logic
    const saveTimeout = useRef<NodeJS.Timeout>();

    const triggerAutoSave = () => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            const data = form.getValues();
            const payload = {
                ...editingClient,
                ...data,
                id: generatedIdRef.current || editingClient?.id || crypto.randomUUID(),
                createdAt: createdAtRef.current || editingClient?.createdAt || new Date().toISOString(),
                activities,
                tasks,
                tags,
                lastUpdate: new Date().toISOString()
            } as CRMClient;
            onSave(payload, { closeModal: false, showToast: false });
        }, 1000);
    };

    useEffect(() => {
        if (!isOpen) return;
        const subscription = form.watch(() => {
            triggerAutoSave();
        });
        return () => subscription.unsubscribe();
    }, [form.watch, editingClient, activities, tasks, tags, isOpen]);

    useEffect(() => {
        if (isOpen) triggerAutoSave();
    }, [activities, tasks, tags]);

    const handleClose = async (open: boolean) => {
        if (!open) {
            // Se for um novo lead e o formulário estiver limpo/intocado, permite fechar sem salvar e sem validar
            if (!editingClient && !form.formState.isDirty) {
                onClose();
                return;
            }

            // Valida o formulário antes de fechar e salvar permanentemente
            const isValid = await form.trigger();
            if (!isValid) {
                toast.error("Por favor, preencha todos os campos obrigatórios (Nome e CPF válidos).");
                return;
            }

            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            const data = form.getValues();
            const payload = {
                ...editingClient,
                ...data,
                id: generatedIdRef.current!,
                createdAt: createdAtRef.current!,
                activities,
                tasks,
                tags,
                lastUpdate: new Date().toISOString()
            } as CRMClient;
            onSave(payload, { closeModal: true, showToast: false });
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || "TIMELINE");
            setNoteInput("");
        }
    }, [editingClient, form, isOpen, initialTab]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const clientData: CRMClient = {
            id: generatedIdRef.current || editingClient?.id || crypto.randomUUID(),
            ...values,
            email: values.email || "",
            phone: values.phone || "",
            createdAt: createdAtRef.current || editingClient?.createdAt || new Date().toISOString(),
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
            
            // Reload history to fetch new message from API
            setTimeout(() => {
                loadWaHistory();
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar WhatsApp. Verifique a integração.");
        } finally {
            setIsSendingWA(false);
        }
    };

    const handleDelete = () => {
        if (onDelete && generatedIdRef.current) {
            const clientName = form.getValues("name") || "este lead";
            if (confirm(`Tem certeza que deseja excluir o lead ${clientName}?`)) {
                onDelete(generatedIdRef.current);
                onClose();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-[100vw] h-[100dvh] sm:max-w-[1000px] sm:h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border/40 font-inter sm:rounded-xl rounded-none">

                {/* Header Estilo Kommo */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold leading-none">{editingClient?.name || "Novo Lead"}</h2>
                                {(editingClient?.value || 0) > 0 && (
                                    <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                        R$ {(editingClient?.value || 0).toLocaleString()}
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
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                onClick={handleDelete}
                                title="Excluir Lead"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl h-8 px-4 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 font-medium" 
                            onClick={() => handleClose(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Coluna Esquerda: Dados e Campos (30%) */}
                    <div className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r overflow-y-auto p-5 bg-muted/5 space-y-6 shrink-0 lg:shrink">
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
                                                    <FormLabel className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        CPF <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="000.000.000-00" 
                                                            className="bg-background h-9 text-[11px]" 
                                                            {...field} 
                                                            onChange={(e) => {
                                                                const formatted = formatCPF(e.target.value);
                                                                field.onChange(formatted);
                                                            }}
                                                            maxLength={14}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
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
                                onClick={() => { setActiveTab("TIMELINE"); setInputType("NOTE"); }}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-tighter h-full px-1 border-b-2 transition-all",
                                    activeTab === "TIMELINE" ? "border-primary text-primary" : "border-transparent text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                Notas
                            </button>
                            <button
                                onClick={() => { setActiveTab("WHATSAPP"); setInputType("WHATSAPP"); }}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-tighter h-full px-1 border-b-2 transition-all",
                                    activeTab === "WHATSAPP" ? "border-emerald-500 text-emerald-500" : "border-transparent text-muted-foreground/60 hover:text-foreground"
                                )}
                            >
                                Chat WhatsApp
                            </button>
                            <button
                                onClick={() => { setActiveTab("TASKS"); setInputType("TASK"); }}
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
                                    {activities.filter(a => a.type === "NOTE").length > 0 ? (
                                        activities.filter(a => a.type === "NOTE").map((activity) => (
                                            <div key={activity.id} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                                    activity.type === "NOTE" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" :
                                                        activity.type === "WHATSAPP" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" :
                                                            "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
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
                                                        activity.type === "NOTE" ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-zinc-900 dark:text-amber-50" : "bg-card border-border/40 text-foreground"
                                                    )}>
                                                        {activity.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
                                            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                                                <History className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                                                <p className="text-xs font-bold text-muted-foreground">Nenhuma nota adicionada</p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1">Escreva uma nota abaixo para registrar.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "WHATSAPP" && (
                                <div className="flex flex-col h-full gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold leading-none">Integração WhatsApp Ativa</p>
                                            <p className="text-[10px] opacity-70">Enviando via Evolution API: {editingClient?.phone || "Nenhum número"}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-200/50 rounded-full"
                                            onClick={() => loadWaHistory()}
                                            title="Atualizar mensagens"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        </Button>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {isLoadingHistory ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                                                <p className="text-xs text-muted-foreground">Carregando histórico...</p>
                                            </div>
                                        ) : waHistory.length > 0 ? (
                                            waHistory.map((msg, idx) => {
                                                const isMe = msg.key?.fromMe;
                                                let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
                                                if (!text) {
                                                    if (msg.message?.audioMessage) text = "🎵 Áudio";
                                                    else if (msg.message?.imageMessage) text = "📷 Imagem";
                                                    else if (msg.message?.videoMessage) text = "🎥 Vídeo";
                                                    else if (msg.message?.documentMessage) text = "📄 Documento";
                                                    else if (msg.message?.stickerMessage) text = "🧩 Figurinha";
                                                    else text = "📎 Mídia enviada";
                                                }
                                                const time = new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                                
                                                return (
                                                    <div key={msg.key?.id || idx} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <div className={cn(
                                                            "p-3 rounded-2xl text-xs max-w-[80%] shadow-lg",
                                                            isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none"
                                                        )}>
                                                            {msg.message?.audioMessage ? (
                                                                <AudioMessageRenderer msg={msg} waInstance={waInstance!} />
                                                            ) : (
                                                                text
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-muted-foreground">{time}</span>
                                                    </div>
                                                );
                                            })
                                        ) : [...activities].filter(a => a.type === "WHATSAPP").sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).length > 0 ? (
                                            [...activities].filter(a => a.type === "WHATSAPP").sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(a => (
                                                <div key={a.id} className="flex flex-col items-end gap-1">
                                                    <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-lg">
                                                        {a.audioUrl ? (
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-emerald-100 text-[10px]">{a.content}</span>
                                                                <audio controls src={a.audioUrl} className="h-8 max-w-[220px]" />
                                                            </div>
                                                        ) : (
                                                            a.content
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                                                <p className="text-xs">Nenhuma mensagem encontrada.</p>
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
                                            className="h-7 text-[10px] uppercase font-bold rounded-lg gap-1 border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-500 dark:hover:bg-amber-500/10"
                                            onClick={() => {
                                                setActiveTab("TASKS");
                                                setIsCreatingTask(true);
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                setNewTaskDate(tomorrow.toISOString().split('T')[0]);
                                            }}
                                        >
                                            <PlusCircle className="w-3 h-3" /> Nova Tarefa
                                        </Button>
                                    </div>
                                    
                                    {isCreatingTask && (
                                        <div className="p-4 bg-card border border-border/40 rounded-xl shadow-sm mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-amber-500">
                                            <Input
                                                placeholder="O que precisa ser feito? (Título da Tarefa)"
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                className="border-none bg-transparent h-8 text-sm px-0 focus-visible:ring-0 shadow-none font-bold text-foreground placeholder:text-muted-foreground"
                                                autoFocus
                                            />
                                            <textarea
                                                placeholder="Adicione uma descrição mais detalhada para a tarefa..."
                                                value={newTaskDescription}
                                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg focus:ring-0 text-xs resize-none p-2 min-h-[60px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-amber-500/50"
                                            />
                                            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/40">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Deadline</span>
                                                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 border h-8">
                                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <Input
                                                            type="date"
                                                            value={newTaskDate}
                                                            onChange={(e) => setNewTaskDate(e.target.value)}
                                                            className="h-full text-[11px] w-full border-none bg-transparent focus-visible:ring-0 shadow-none px-0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Responsável</span>
                                                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 border h-8">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <Input
                                                            placeholder="Nome do responsável"
                                                            value={newTaskAssignee}
                                                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                                                            className="h-full text-[11px] w-full border-none bg-transparent focus-visible:ring-0 shadow-none px-0"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" && newTaskTitle.trim()) {
                                                                    handleSaveNewTask();
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2 pt-1">
                                                <Button variant="ghost" size="sm" onClick={() => setIsCreatingTask(false)} className="h-8 text-xs text-muted-foreground">
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveNewTask}
                                                    disabled={!newTaskTitle.trim()}
                                                    className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white gap-1"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                    Salvar Tarefa
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {tasks.length > 0 ? (
                                        tasks.map(task => (
                                            editingTaskId === task.id ? (
                                                <div key={task.id} className="p-4 bg-card border border-amber-500/50 rounded-xl shadow-sm mb-4 space-y-3">
                                                    <Input
                                                        placeholder="O que precisa ser feito?"
                                                        value={editTaskTitle}
                                                        onChange={(e) => setEditTaskTitle(e.target.value)}
                                                        className="border-none bg-transparent h-8 text-sm px-0 focus-visible:ring-0 shadow-none font-bold text-foreground"
                                                    />
                                                    <textarea
                                                        placeholder="Adicione uma descrição..."
                                                        value={editTaskDescription}
                                                        onChange={(e) => setEditTaskDescription(e.target.value)}
                                                        className="w-full bg-muted/30 border border-border/50 rounded-lg focus:ring-0 text-xs resize-none p-2 min-h-[60px] text-foreground"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/40">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Deadline</span>
                                                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 border h-8">
                                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                                <Input type="date" value={editTaskDate} onChange={(e) => setEditTaskDate(e.target.value)} className="h-full text-[11px] w-full border-none bg-transparent px-0 focus-visible:ring-0 shadow-none" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Responsável</span>
                                                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 border h-8">
                                                                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                                <Input value={editTaskAssignee} onChange={(e) => setEditTaskAssignee(e.target.value)} className="h-full text-[11px] w-full border-none bg-transparent px-0 focus-visible:ring-0 shadow-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2 pt-1">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingTaskId(null)} className="h-8 text-xs text-muted-foreground">Cancelar</Button>
                                                        <Button size="sm" onClick={handleSaveEditTask} disabled={!editTaskTitle.trim()} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Salvar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={task.id} className="p-4 bg-card border border-border/40 rounded-xl shadow-sm hover:border-amber-500/50 transition-colors group">
                                                    <div className="flex items-start gap-3">
                                                        <div 
                                                            className={cn("w-5 h-5 rounded-md border-2 transition-colors shrink-0 mt-0.5 flex items-center justify-center cursor-pointer", task.status === "DONE" || task.status === "COMPLETED" ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted hover:border-amber-500 group-hover:bg-amber-500/10")}
                                                            onClick={() => handleChangeTaskStatus(task.id, task.status === "DONE" || task.status === "COMPLETED" ? "TODO" : "DONE")}
                                                        >
                                                            {(task.status === "DONE" || task.status === "COMPLETED") && <CheckCircle2 className="w-3 h-3" />}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className={cn("text-sm font-bold transition-all", task.status === "DONE" || task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground")}>{task.title}</p>
                                                                    {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-500" onClick={() => handleEditTaskClick(task)}>
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-500" onClick={() => handleDeleteTask(task.id)}>
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-border/40">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none">Deadline</span>
                                                                        <span className="text-[11px] font-medium text-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none">Responsável</span>
                                                                        <span className="text-[11px] font-medium text-foreground">{task.assignee || "Não atribuído"}</span>
                                                                    </div>
                                                                </div>
                                                                {task.createdAt && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 leading-none">Criado</span>
                                                                            <span className="text-[11px] font-medium text-foreground">{new Date(task.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <select 
                                                                    value={task.status === "COMPLETED" ? "DONE" : task.status === "PENDING" ? "TODO" : task.status} 
                                                                    onChange={(e) => handleChangeTaskStatus(task.id, e.target.value as any)}
                                                                    className={cn("ml-auto text-[10px] uppercase font-bold px-2 py-1 rounded-md border cursor-pointer focus:ring-0 outline-none appearance-none text-center", 
                                                                        (task.status === "DONE" || task.status === "COMPLETED") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                                                                        task.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : 
                                                                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                                    )}
                                                                >
                                                                    <option value="TODO" className="bg-background text-foreground">A Fazer</option>
                                                                    <option value="IN_PROGRESS" className="bg-background text-foreground">Em Progresso</option>
                                                                    <option value="DONE" className="bg-background text-foreground">Concluído</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-amber-50/30 dark:bg-amber-500/5 rounded-3xl border-2 border-dashed border-amber-200/50 dark:border-amber-500/20">
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
                            <div className="flex gap-2 items-center bg-muted/30 border rounded-2xl p-1.5 focus-within:ring-2 ring-primary/20 focus-within:bg-background transition-all shadow-sm">
                                <Select value={inputType} onValueChange={(v: any) => {
                                    setInputType(v);
                                    if(v === "WHATSAPP") setActiveTab("WHATSAPP");
                                    else if(v === "TASK") setActiveTab("TASKS");
                                    else setActiveTab("TIMELINE");
                                }}>
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
                                    ref={noteInputRef}
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder={inputType === "WHATSAPP" ? (isRecordingAudio ? "Gravando áudio..." : "Enviar mensagem via WhatsApp...") : inputType === "TASK" ? "Título da nova tarefa (Enter para agendar)..." : "Escrever uma nota interna..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-10 py-2 font-medium text-foreground placeholder:text-muted-foreground"
                                    disabled={isRecordingAudio}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddNote();
                                        }
                                    }}
                                />
                                {inputType === "WHATSAPP" && (
                                    <Button
                                        onClick={isRecordingAudio ? stopRecording : startRecording}
                                        type="button"
                                        size="icon"
                                        variant={isRecordingAudio ? "destructive" : "outline"}
                                        className={cn("h-10 w-10 rounded-xl transition-all shadow-md", isRecordingAudio ? "animate-pulse bg-red-500 hover:bg-red-600 border-red-500 text-white" : "")}
                                    >
                                        {isRecordingAudio ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                    </Button>
                                )}
                                <Button
                                    onClick={handleAddNote}
                                    disabled={!noteInput.trim() || isSendingWA || isRecordingAudio}
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
