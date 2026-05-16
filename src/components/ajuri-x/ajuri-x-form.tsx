'use client';

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    Check,
    ChevronsRight,
    ArrowRight,
    ArrowLeft,
    Info,
    Sparkles,
    Users,
    Save,
    FileText,
    Download
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Header, Footer, ImageRun } from "docx";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CRMClient } from "@/types/crm";

import { RUBRICAS, BANKS } from "@/constants/ajuri-data";
import { base64ToArrayBuffer, createDocumentHeader, createDocumentFooter } from "@/utils/documentUtils";
import { DEFAULT_OFFICE } from "@/types/petition";
import { formatCurrency, valorPorExtenso } from "@/utils/currency";
import { PETITION_TEMPLATES, ACTIVE_PETITION_TEMPLATES } from "@/constants/templates";
import { Badge } from "@/components/ui/badge";
import { generatePetitionPDF } from "@/utils/pdfGenerator";
import {
    getTarifasBancariasChildren,
    getAtrasoVooChildren,
    getSaudeChildren,
    getGolpePixChildren,
    getDivorcioChildren,
    getUsucapiaoChildren,
    getConcursoChildren,
    getTransitoChildren
} from "@/constants/petition-models";
import { useSearchParams, useRouter } from "next/navigation";
import { generatePetition } from "@/utils/petitionGenerator";
import { ComarcaField } from "./comarca-field";
import { triggerWebhooks } from "@/lib/services/webhook-service";

// --- Schema ---
const formSchema = z.object({
    // Client
    nomeCliente: z.string().min(1, "Nome é obrigatório"),
    nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
    estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
    profissao: z.string().min(1, "Profissão é obrigatória"),
    cpfCliente: z.string().min(11, "CPF inválido"),
    rgCliente: z.string().min(5, "RG inválido"),
    enderecoCliente: z.string().min(5, "Endereço completo é obrigatório"),
    bairroCliente: z.string().min(1, "Bairro é obrigatório"),
    cepCliente: z.string().min(8, "CEP inválido"),

    // Defendant
    requeridoNome: z.string().min(1, "Selecione ou digite o requerido"),
    cnpjRequerido: z.string().min(14, "CNPJ é obrigatório"),
    enderecoRequerido: z.string().min(5, "Endereço do requerido é obrigatório"),

    // Charges
    nomeDesconto: z.string().min(1, "Selecione a rubrica"),
    valorDescontos: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),

    // Damages
    danoMoral: z.coerce.number().min(0, "Valor não pode ser negativo").default(0),

    // Location
    comarca: z.string().min(1, "Comarca é obrigatória").default(""),

    // Visual Identity
    visualIdentity: z.enum(["default", "none"], {
        required_error: "Selecione uma identidade visual",
    }).default("default"),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
    { id: 1, title: "Autor", description: "Dados do Cliente" },
    { id: 2, title: "Réu", description: "Dados do Banco" },
    { id: 3, title: "Configuração", description: "Valores e Identidade" },
];

export default function AjuriXForm() {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [leads, setLeads] = useState<CRMClient[]>([]);
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [targetFormat, setTargetFormat] = useState<'docx' | 'pdf'>('docx');

    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get("edit");



    const selectedTemplate = PETITION_TEMPLATES.find(t => t.id === selectedTemplateId);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nomeCliente: "",
            nacionalidade: "Brasileira",
            estadoCivil: "",
            profissao: "",
            cpfCliente: "",
            rgCliente: "",
            enderecoCliente: "",
            bairroCliente: "",
            cepCliente: "",
            requeridoNome: "",
            cnpjRequerido: "",
            enderecoRequerido: "",
            nomeDesconto: "",
            valorDescontos: undefined,
            danoMoral: undefined,
            comarca: "",
            visualIdentity: "default",
        },
    });

    const valorDescontos = useWatch({ control: form.control, name: "valorDescontos" });
    const danoMoral = useWatch({ control: form.control, name: "danoMoral" });
    const requeridoNome = useWatch({ control: form.control, name: "requeridoNome" });

    useEffect(() => {
        const bank = BANKS.find(b => b.name === requeridoNome);
        if (bank) {
            form.setValue("cnpjRequerido", bank.cnpj);
            form.setValue("enderecoRequerido", bank.address);
        }
    }, [requeridoNome, form]);

    const inferTemplateId = (title: string): string | null => {
        const t = title.toLowerCase();
        if (t.includes("tarifas")) return "TARIFAS_INDEVIDAS";
        if (t.includes("rmc")) return "RMC";
        if (t.includes("voo") || t.includes("atraso")) return "ATRASO_VOO";
        if (t.includes("saude") || t.includes("cirurgia")) return "SAUDE_CIRURGIA";
        if (t.includes("divorcio")) return "DIVORCIO_CONSENSUAL";
        if (t.includes("usucapiao")) return "USUCAPIAO_EXTRAJUDICIAL";
        if (t.includes("pix") || t.includes("golpe")) return "GOLPE_PIX";
        if (t.includes("concurso")) return "MS_CONCURSO";
        if (t.includes("transito")) return "MULTA_TRANSITO";
        return null;
    };

    useEffect(() => {
        const stored = localStorage.getItem("ajuri_crm_clients");
        if (stored) {
            setLeads(JSON.parse(stored));
        }

        // LOAD FOR EDIT
        if (editId) {
            setIsLoadingEdit(true);

            // Give a tiny bit of time for DOM/States to settle
            const timer = setTimeout(() => {
                const historyStored = localStorage.getItem("ajuri_petitions_history");
                let found = false;

                if (historyStored) {
                    const history = JSON.parse(historyStored);
                    const petition = history.find((p: any) => p.id === editId);

                    if (petition) {
                        if (petition.formData) {
                            form.reset(petition.formData);

                            const templateId = petition.templateId || inferTemplateId(petition.title);

                            if (templateId) {
                                setSelectedTemplateId(templateId);
                                setStep(3); // Start at review step
                                toast.info(`Editando: ${petition.title}`);
                                found = true;
                            } else {
                                toast.error("Não foi possível identificar o modelo desta petição.");
                            }
                        } else {
                            toast.error("Este rascunho não possui dados editáveis.");
                        }
                    }
                }

                if (!found) {
                    // Remove edit param if not found
                    const url = new URL(window.location.href);
                    url.searchParams.delete("edit");
                    window.history.replaceState({}, "", url.toString());
                }
                setIsLoadingEdit(false);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [editId, form]);

    const descontosDobro = Number(valorDescontos || 0) * 2;
    const danosTotais = descontosDobro + Number(danoMoral || 0);

    const nextStep = async () => {
        let isValid = false;
        if (step === 1) {
            isValid = await form.trigger([
                'nomeCliente', 'nacionalidade', 'estadoCivil', 'profissao',
                'cpfCliente', 'rgCliente', 'enderecoCliente', 'bairroCliente', 'cepCliente'
            ]);
        } else if (step === 2) {
            isValid = await form.trigger(['requeridoNome', 'cnpjRequerido', 'enderecoRequerido']);
        }

        if (isValid) {
            if (step === 1) {
                // Save/Update lead on first step progression
                handleCRMIntegration(form.getValues());
            }
            setStep(prev => prev + 1);
        }
    };

    const handleLoadLead = (leadId: string) => {
        if (leadId === "none") {
            form.reset({
                ...form.getValues(),
                nomeCliente: "",
                cpfCliente: "",
                rgCliente: "",
                nacionalidade: "Brasileiro(a)",
                estadoCivil: "",
                profissao: "",
                enderecoCliente: "",
                bairroCliente: "",
                cepCliente: "",
            });
            toast.info("Campos limpos para preenchimento manual.");
            return;
        }

        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            form.setValue("nomeCliente", lead.name);
            form.setValue("cpfCliente", lead.cpf || "");
            form.setValue("rgCliente", lead.rg || "");

            // Gender detection heuristic for nationality
            const isFemale = lead.name.split(' ')[0].toLowerCase().endsWith('a');
            form.setValue("nacionalidade", lead.nacionalidade || (isFemale ? "Brasileira" : "Brasileiro"));

            form.setValue("estadoCivil", lead.estadoCivil || "");
            form.setValue("profissao", lead.profissao || "");
            form.setValue("enderecoCliente", lead.address || "");
            form.setValue("bairroCliente", lead.bairro || "");
            form.setValue("cepCliente", lead.cep || "");
            toast.success(`Dados de ${lead.name} carregados!`);
        }
    };

    // Auto-detect gender for nationality on name change
    const nomeCliente = useWatch({ control: form.control, name: "nomeCliente" });
    useEffect(() => {
        if (!nomeCliente || nomeCliente.trim().length < 3) return;

        const firstName = nomeCliente.trim().split(' ')[0].toLowerCase();
        const isFemale = firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('na');

        const currentNationality = form.getValues("nacionalidade");
        const brazilianTerms = ["Brasileiro", "Brasileira", "Brasileiro(a)"];
        if (brazilianTerms.includes(currentNationality) || !currentNationality) {
            form.setValue("nacionalidade", isFemale ? "Brasileira" : "Brasileiro");
        }
    }, [nomeCliente, form]);

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };


    const handleCRMIntegration = (data: FormValues) => {
        try {
            const STORAGE_KEY = "ajuri_crm_clients";
            const stored = localStorage.getItem(STORAGE_KEY);
            let clients: CRMClient[] = stored ? JSON.parse(stored) : [];

            // Check if client already exists (by CPF or name)
            const exists = clients.some(c =>
                (c.cpf && c.cpf === data.cpfCliente) ||
                c.name.toLowerCase() === data.nomeCliente.toLowerCase()
            );

            if (!exists) {
                const newClient: CRMClient = {
                    id: crypto.randomUUID(),
                    name: data.nomeCliente,
                    email: "",
                    phone: "",
                    status: "NOVO",
                    cpf: data.cpfCliente,
                    rg: data.rgCliente,
                    nacionalidade: data.nacionalidade,
                    estadoCivil: data.estadoCivil,
                    profissao: data.profissao,
                    address: data.enderecoCliente,
                    bairro: data.bairroCliente,
                    cep: data.cepCliente,
                    createdAt: new Date().toISOString(),
                    lastUpdate: new Date().toISOString(),
                    processCount: 1,
                    activities: [{
                        id: crypto.randomUUID(),
                        type: "SYSTEM",
                        content: `Lead capturado via AJURI X ao gerar minuta de ${selectedTemplate?.title || "Petição"}.`,
                        timestamp: new Date().toISOString()
                    }],
                    tasks: [],
                    tags: [],
                    pipelineId: "default"
                };
                clients = [...clients, newClient];
            } else {
                // Update existing client activity and ALL DATA
                clients = clients.map(c => {
                    const isMatch = (c.cpf && c.cpf === data.cpfCliente) || c.name.toLowerCase() === data.nomeCliente.toLowerCase();
                    if (isMatch) {
                        return {
                            ...c,
                            name: data.nomeCliente,
                            cpf: data.cpfCliente,
                            rg: data.rgCliente,
                            nacionalidade: data.nacionalidade,
                            estadoCivil: data.estadoCivil,
                            profissao: data.profissao,
                            address: data.enderecoCliente,
                            bairro: data.bairroCliente,
                            cep: data.cepCliente,
                            lastUpdate: new Date().toISOString(),
                            activities: [
                                {
                                    id: crypto.randomUUID(),
                                    type: "SYSTEM",
                                    content: `Sincronização AJURI X: Todos os dados cadastrais (RG, Estado Civil, Endereço, etc) foram atualizados automaticamente.`,
                                    timestamp: new Date().toISOString()
                                },
                                ...(c.activities || [])
                            ]
                        };
                    }
                    return c;
                });
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
            setLeads(clients);

            // Trigger Webhooks
            const updatedOrNewClient = clients.find(c =>
                (c.cpf && c.cpf === data.cpfCliente) ||
                c.name.toLowerCase() === data.nomeCliente.toLowerCase()
            );
            if (updatedOrNewClient) {
                triggerWebhooks(exists ? "CLIENT_UPDATED" : "CLIENT_CREATED", updatedOrNewClient);
            }

            window.dispatchEvent(new Event('storage'));
            console.log("CRM sincronizado com sucesso.");
        } catch (e) {
            console.error("Erro ao sincronizar com CRM:", e);
        }
    };

    const handleSaveOnly = async () => {
        const data = form.getValues();
        setIsGenerating(true);
        try {
            handleCRMIntegration(data);
            const historyStored = localStorage.getItem("ajuri_petitions_history");
            let history = historyStored ? JSON.parse(historyStored) : [];

            const petitionData = {
                id: editId || crypto.randomUUID(),
                title: `${selectedTemplate?.title || "Petição"} - ${data.nomeCliente}`,
                status: 'draft',
                type: 'ajuri_x',
                updated_at: new Date().toISOString(),
                templateId: selectedTemplateId,
                formData: data,
            };

            if (editId) {
                const index = history.findIndex((p: any) => p.id === editId);
                if (index !== -1) history[index] = petitionData;
                else history.push(petitionData);
            } else {
                history.push(petitionData);
            }

            localStorage.setItem("ajuri_petitions_history", JSON.stringify(history));
            window.dispatchEvent(new Event('petitions-updated'));
            toast.success(editId ? "Rascunho atualizado com sucesso!" : "Petição salva nos rascunhos!");
        } catch (error) {
            toast.error("Erro ao salvar rascunho.");
        } finally {
            setIsGenerating(false);
        }
    };

    async function onSubmit(data: FormValues) {
        setIsGenerating(true);
        try {
            handleCRMIntegration(data);
            if (targetFormat === 'docx') {
                await generatePetition(data, selectedTemplateId);
            } else {
                await generatePetitionPDF(data, selectedTemplateId);
            }

            // Save to history
            const petitionData = {
                id: editId || crypto.randomUUID(),
                title: `${selectedTemplate?.title || "Petição"} - ${data.nomeCliente}`,
                status: 'completed',
                type: 'ajuri_x',
                updated_at: new Date().toISOString(),
                isLocal: true,
                formData: data,
                templateId: selectedTemplateId
            };

            const stored = localStorage.getItem("ajuri_petitions_history");
            let history = stored ? JSON.parse(stored) : [];

            if (editId) {
                // Update existing
                history = history.map((p: any) => p.id === editId ? petitionData : p);
            } else {
                // Add new
                history = [petitionData, ...history];
            }

            localStorage.setItem("ajuri_petitions_history", JSON.stringify(history));
            window.dispatchEvent(new Event('petitions-updated'));

            toast.success(editId ? "Petição atualizada com sucesso!" : "Documento gerado e salvo no histórico!");
        } catch (error) {
            console.error(error);
            toast.error(`Erro ao gerar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setIsGenerating(false);
        }
    }

    if (isLoadingEdit) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 animate-pulse">Carregando rascunho...</p>
            </div>
        );
    }

    if (!selectedTemplateId) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">
                        AJURI X
                    </h1>
                    <p className="text-zinc-400">Escolha o tipo de petição que deseja gerar com inteligência artificial.</p>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {ACTIVE_PETITION_TEMPLATES.map((template) => (
                        <Card
                            key={template.id}
                            className="group flex flex-col hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-900/10 border-zinc-800 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
                            onClick={() => setSelectedTemplateId(template.id)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {template.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-[10px] uppercase font-bold tracking-tight bg-emerald-500/5 text-emerald-500 border-emerald-500/20">{tag}</Badge>
                                        ))}
                                    </div>
                                    <Sparkles className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <CardTitle className="text-xl font-bold group-hover:text-emerald-400 transition-colors text-white">{template.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px] text-zinc-400 text-sm leading-relaxed">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 p-3 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                                    <Info className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                    <span>Geração automática com inteligência artificial.</span>
                                </div>
                            </CardContent>
                            <div className="p-6 pt-2">
                                <Button className="w-full gap-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all bg-zinc-900 border-zinc-800 text-zinc-300" variant="outline">
                                    Selecionar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
            <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
                            AJURI X
                        </h1>
                        {editId && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[10px] font-bold px-3 py-1 animate-pulse">
                                Modo Edição
                            </Badge>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editId ? router.push('/peticoes') : setSelectedTemplateId(null)}
                        className="text-zinc-500 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> {editId ? "Cancelar Edição" : "Trocar Modelo"}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[10px] font-bold">
                        {selectedTemplate?.title}
                    </Badge>
                    <p className="text-zinc-500 text-xs">Preencha os dados abaixo para gerar sua peça.</p>
                </div>

                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 -z-10 rounded-full" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />

                    {STEPS.map((s) => {
                        const isActive = step >= s.id;
                        const isCurrent = step === s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2 bg-black px-2">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                                    {isActive ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <span className="font-bold text-sm md:text-base">{s.id}</span>}
                                </div>
                                <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`}>{s.title}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-tighter sm:hidden ${isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`}>{s.id}º Passo</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-emerald-900/10">
                <CardContent className="p-6 md:p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 1 && (
                                        <div className="space-y-8">
                                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-8 relative overflow-hidden group/import">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/import:opacity-10 transition-opacity">
                                                    <Users className="w-24 h-24 -mr-8 -mt-8" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-3 mb-5">
                                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                            <Users className="w-5 h-5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Base de Clientes & Leads</h3>
                                                            <p className="text-xs text-zinc-500">Pule o preenchimento manual usando dados cadastrados.</p>
                                                        </div>
                                                    </div>
                                                    <Select onValueChange={handleLoadLead}>
                                                        <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-white h-12 rounded-xl focus:ring-emerald-500/50">
                                                            <SelectValue placeholder="Selecione um cliente para importar..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                                                            <SelectItem value="none" className="py-3 cursor-pointer focus:bg-zinc-800 text-zinc-400 italic">
                                                                Nenhum (Limpar campos)
                                                            </SelectItem>
                                                            {leads.length > 0 ? (
                                                                leads.map(lead => (
                                                                    <SelectItem key={lead.id} value={lead.id} className="py-3 cursor-pointer focus:bg-emerald-500/10">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">{lead.name}</span>
                                                                            <span className="text-[10px] text-zinc-500">{lead.cpf || "Sem CPF"} • {lead.email || "Sem email"}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-xs text-zinc-500 text-center italic">
                                                                    Nenhum cliente cadastrado no CRM ainda.
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="col-span-full pb-4 border-b border-zinc-800/50 mb-2 flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        <span className="w-1.5 h-5 bg-emerald-500 rounded-full block"></span>
                                                        Dados do Autor
                                                    </h3>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-mono">Etapa 01 de 03</span>
                                                </div>
                                                <FormField control={form.control} name="nomeCliente" render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel className="text-zinc-400">Nome Completo do Autor</FormLabel>
                                                        <FormControl><Input placeholder="Digite o nome completo do autor" className="bg-zinc-900 border-zinc-800 text-white focus:ring-emerald-500" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="nacionalidade" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">Nacionalidade</FormLabel>
                                                        <FormControl><Input placeholder="Ex: Brasileira" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="estadoCivil" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">Estado Civil</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                                    <SelectValue placeholder="Selecione o estado civil" />
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
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="profissao" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">Profissão</FormLabel>
                                                        <FormControl><Input placeholder="Informe a ocupação atual" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="cpfCliente" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">CPF</FormLabel>
                                                        <FormControl><Input placeholder="000.000.000-00" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="rgCliente" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">RG</FormLabel>
                                                        <FormControl><Input placeholder="Informe o número do RG" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="cepCliente" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">CEP</FormLabel>
                                                        <FormControl><Input placeholder="00000-000" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="bairroCliente" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400">Bairro</FormLabel>
                                                        <FormControl><Input placeholder="Nome do bairro" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="enderecoCliente" render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel className="text-zinc-400">Logradouro e Número</FormLabel>
                                                        <FormControl><Input placeholder="Rua, Número e Complemento" className="bg-zinc-900 border-zinc-800 text-white" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div className="pb-4 border-b border-zinc-800 mb-4">
                                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                    <span className="w-1 h-6 bg-emerald-500 rounded-sm block"></span>
                                                    Dados do Requerido
                                                </h3>
                                            </div>
                                            <FormField control={form.control} name="requeridoNome" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-400">Instituição Financeira</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12">
                                                                <SelectValue placeholder="Selecione o Banco para preenchimento automático" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {BANKS.map((b) => (
                                                                <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 opacity-75 pointer-events-none filter grayscale">
                                                <FormField control={form.control} name="cnpjRequerido" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-500">CNPJ (Automático)</FormLabel>
                                                        <FormControl><Input readOnly placeholder="CNPJ será preenchido ao selecionar o banco" className="bg-zinc-950 border-zinc-800 text-zinc-400" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="enderecoRequerido" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-500">Endereço (Automático)</FormLabel>
                                                        <FormControl><Input readOnly placeholder="Endereço será preenchido ao selecionar o banco" className="bg-zinc-950 border-zinc-800 text-zinc-400" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <p className="text-xs text-zinc-600 italic mt-2">* Os dados do banco são preenchidos automaticamente para garantir precisão jurídica.</p>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-8">
                                            <div className="pb-4 border-b border-zinc-800 mb-4">
                                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                    <span className="w-1 h-6 bg-emerald-500 rounded-sm block"></span>
                                                    Detalhes da Causa e Visual
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="text-md font-medium text-emerald-400 uppercase tracking-widest text-xs">Cobrança Indevida</h4>
                                                    <FormField control={form.control} name="nomeDesconto" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-zinc-400">Rubrica de Desconto</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                                        <SelectValue placeholder="Selecione o tipo de tarifa cobrada" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-60">
                                                                    {RUBRICAS.map((r) => (
                                                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="valorDescontos" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-zinc-400">
                                                                {selectedTemplate?.damage_label || "Valor Médio Mensal (R$)"}
                                                            </FormLabel>
                                                            <FormControl><Input type="number" step="0.01" placeholder="0,00" className="bg-zinc-900 border-zinc-800 text-white font-mono text-lg" {...field} /></FormControl>
                                                            <CardDescription className="text-emerald-500 font-mono text-xs">
                                                                {field.value > 0 && valorPorExtenso(field.value)}
                                                            </CardDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-md font-medium text-emerald-400 uppercase tracking-widest text-xs">Danos Morais</h4>
                                                    <FormField control={form.control} name="danoMoral" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-zinc-400">Indenização Desejada (R$)</FormLabel>
                                                            <FormControl><Input type="number" step="100" placeholder="Ex: 5.000,00" className="bg-zinc-900 border-zinc-800 text-white font-mono text-lg" {...field} /></FormControl>
                                                            <CardDescription className="text-emerald-500 font-mono text-xs">
                                                                {field.value > 0 && valorPorExtenso(field.value)}
                                                            </CardDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="text-md font-medium text-emerald-400 uppercase tracking-widest text-xs">Jurisdição</h4>
                                                    <FormField control={form.control} name="comarca" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-zinc-400">Comarca / Cidade do Juízo</FormLabel>
                                                            <ComarcaField
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Ex: Manaus/AM"
                                                            />
                                                            <FormDescription className="text-[10px] text-zinc-500">
                                                                Cidade onde a ação será protocolada.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                <div className="space-y-4 p-6 border border-zinc-800 rounded-xl bg-zinc-950">
                                                    <h4 className="text-md font-medium text-emerald-400 uppercase tracking-widest text-xs">Identidade Visual</h4>
                                                    <FormField control={form.control} name="visualIdentity" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-zinc-400">Selecione o Timbre (Obrigatório)</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                                        <SelectValue placeholder="Escolha a identidade visual" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="default">Usar Identidade Salva (Cabeçalho/Rodapé)</SelectItem>
                                                                    <SelectItem value="none">Sem Timbre (Documento Liso)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription className="text-xs text-zinc-500 mt-2">
                                                                A opção "Identidade Salva" utilizará as imagens configuradas na aba "Customizar Doc".
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-zinc-900/50 p-6 border border-zinc-800/50 backdrop-blur-sm mt-8">
                                                <h4 className="text-sm font-semibold text-zinc-500 uppercase mb-4">Resumo dos Cálculos Estaduais</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex justify-between items-center p-3 rounded bg-black/40">
                                                        <span className="text-zinc-400 text-sm">Restituição em Dobro</span>
                                                        <div className="text-right">
                                                            <div className="text-white font-mono">{formatCurrency(descontosDobro)}</div>
                                                            <div className="text-[10px] text-zinc-500">{valorPorExtenso(descontosDobro)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 rounded bg-emerald-950/20 border border-emerald-900/30">
                                                        <span className="text-emerald-400 font-bold text-sm">Valor Total da Causa</span>
                                                        <div className="text-right">
                                                            <div className="text-emerald-300 font-mono text-xl font-bold">{formatCurrency(danosTotais)}</div>
                                                            <div className="text-[10px] text-emerald-600">{valorPorExtenso(danosTotais)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-between pt-8 border-t border-zinc-900 mt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={step === 1 || isGenerating}
                                    className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                                </Button>

                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-emerald-400 hover:text-black transition-all">
                                        Próximo <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSaveOnly}
                                            disabled={isGenerating}
                                            className="border-zinc-700 hover:bg-zinc-800 text-emerald-400 gap-2 min-w-[150px]"
                                        >
                                            <Save className="w-4 h-4" />
                                            {editId ? "Atualizar Petição" : "Salvar Petição"}
                                        </Button>

                                        <Button
                                            type="submit"
                                            onClick={() => setTargetFormat('pdf')}
                                            disabled={isGenerating}
                                            variant="outline"
                                            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2 min-w-[120px]"
                                        >
                                            {isGenerating && targetFormat === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                            {isGenerating && targetFormat === 'pdf' ? "Gerando..." : "Baixar .PDF"}
                                        </Button>

                                        <Button
                                            type="submit"
                                            onClick={() => setTargetFormat('docx')}
                                            disabled={isGenerating}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[180px] shadow-lg shadow-emerald-700/20 gap-2 transition-all"
                                        >
                                            {isGenerating && targetFormat === 'docx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                            {isGenerating && targetFormat === 'docx' ? "Gerando..." : "Baixar .DOCX"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="text-center mt-12 text-zinc-600 text-sm">
                <p>Desenvolvido com tecnologia Rarity AI</p>
            </div>
        </div>
    );
}
