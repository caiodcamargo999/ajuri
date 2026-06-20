"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, Pencil, Trash, Cloud, HardDrive, Download, FileDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { generatePetition } from "@/utils/petitionGenerator"
import { generatePetitionPDF } from "@/utils/pdfGenerator"

interface Petition {
    id: string
    title: string
    status: string
    updated_at: string
    type: string | null
    isLocal?: boolean
    formData?: any
    templateId?: string
    date?: string
}

interface MyPetitionsListProps {
    searchQuery?: string;
    filterStatus?: string;
}

export function MyPetitionsList({ searchQuery = "", filterStatus = "all" }: MyPetitionsListProps) {
    const supabase = createClient()
    const router = useRouter()
    const [petitions, setPetitions] = useState<Petition[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAllPetitions = async () => {
        setLoading(true)
        try {
            // 1. Get Local Petitions
            const localStored = localStorage.getItem("ajuri_petitions_history")
            const localPetitions: Petition[] = localStored ? JSON.parse(localStored).map((p: any) => ({ ...p, isLocal: true })) : []

            // 2. Get Cloud Petitions
            const { data: { user } } = await supabase.auth.getUser()
            let cloudPetitions: Petition[] = []

            if (user) {
                const { data } = await supabase
                    .from('petitions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })

                if (data) cloudPetitions = data
            }

            // Sync/Merge: For MVP we just show both, sorting by updated_at
            const combined = [...cloudPetitions, ...localPetitions]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

            // Deduplicate if needed (by title or ID if shared)
            const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

            setPetitions(unique)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredPetitions = petitions.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all'
            ? true
            : filterStatus === 'ajuri_x'
                ? p.type === 'ajuri_x' || p.isLocal // Assume local as AJURI X generated often, or refine logic if needed
                : p.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        fetchAllPetitions()

        // Listen for updates from other components
        window.addEventListener('petitions-updated', fetchAllPetitions);
        return () => window.removeEventListener('petitions-updated', fetchAllPetitions);
    }, [supabase])

    const handleDelete = (id: string, isLocal?: boolean) => {
        if (isLocal) {
            const stored = localStorage.getItem("ajuri_petitions_history");
            if (stored) {
                const history = JSON.parse(stored);
                localStorage.setItem("ajuri_petitions_history", JSON.stringify(history.filter((p: any) => p.id !== id)));
                toast.success("Petição excluída localmente");
                fetchAllPetitions();
            }
        } else {
            // Supabase delete logic here
            toast.info("Apenas petições locais podem ser excluídas nesta versão demo.");
        }
    }

    const handleDownload = async (petition: Petition) => {
        if (!petition.formData) {
            toast.error("Esta petição antiga não possui dados para ser regenerada.");
            return;
        }

        const t = toast.loading("Gerando documento...");
        try {
            await generatePetition(petition.formData, petition.templateId || null);
            toast.success("Documento baixado com sucesso!", { id: t });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar documento.", { id: t });
        }
    }

    const handleDownloadPDF = async (petition: Petition) => {
        if (!petition.formData) {
            toast.error("Esta petição antiga não possui dados para ser regenerada.");
            return;
        }

        const t = toast.loading("Gerando PDF...");
        try {
            await generatePetitionPDF(petition.formData, petition.templateId || null);
            toast.success("PDF gerado com sucesso!", { id: t });
        } catch (error) {
            console.error(error);
            toast.error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { id: t });
        }
    }

    const handleEdit = (petition: Petition) => {
        if (petition.type === 'ajuri_x') {
            router.push(`/ajuri-x?edit=${petition.id}`);
        } else {
            toast.info("Apenas petições geradas pelo AJURI X podem ser editadas nesta versão.");
        }
    }

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-muted/30 border-dashed rounded-2xl h-40">
                        <CardHeader className="space-y-3">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (petitions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 p-12 text-center bg-muted/10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 transition-transform hover:scale-110 duration-300">
                    <FileText className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="mt-6 text-xl font-bold">Nenhuma petição encontrada</h3>
                <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Seu histórico de documentos aparecerá aqui. Comece pela Biblioteca de Modelos!
                </p>
                <Button variant="outline" className="rounded-xl px-6" onClick={() => window.location.reload()}>Atualizar Lista</Button>
            </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPetitions.map((petition) => {
                const [templateName, ...clientNameParts] = petition.title.split(' - ');
                const clientName = clientNameParts.join(' - ') || petition.formData?.nomeCliente || 'Cliente não informado';
                
                const dateToUse = petition.updated_at || petition.date;
                const isValidDate = dateToUse && !isNaN(new Date(dateToUse).getTime());
                const formattedDate = isValidDate ? new Date(dateToUse).toLocaleDateString('pt-BR') : 'Data indisponível';

                return (
                    <Card
                        key={petition.id}
                        className="group relative overflow-hidden transition-all hover:bg-white/5 bg-transparent border-white/10 rounded-2xl flex flex-col cursor-pointer"
                        onClick={() => handleEdit(petition)}
                    >
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1 pr-4">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg font-medium line-clamp-2 group-hover:text-foreground transition-colors leading-tight tracking-tight">
                                            {templateName}
                                        </CardTitle>
                                        {petition.isLocal ? (
                                            <HardDrive className="h-3 w-3 text-muted-foreground/40 shrink-0 mt-0.5" />
                                        ) : (
                                            <Cloud className="h-3 w-3 text-blue-500/50 shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                        <span className="text-sm font-medium text-muted-foreground truncate">
                                            {clientName}
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs font-medium pt-1">
                                        Data: {formattedDate}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-full h-9 w-9 -mr-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                    <MoreVertical className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl w-48">
                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(petition)}>
                                        <Pencil className="h-4 w-4" /> Editar Rascunho
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownload(petition)}>
                                        <Download className="h-4 w-4" /> Baixar .DOCX
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownloadPDF(petition)}>
                                        <FileDown className="h-4 w-4" /> Baixar .PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(petition.id, petition.isLocal)} className="text-destructive focus:text-destructive gap-2 cursor-pointer">
                                        <Trash className="h-4 w-4" /> Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center mt-auto pt-2">
                        <Badge variant="secondary" className={cn(
                            "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                            petition.status === 'draft' ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                        )}>
                            {petition.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                        </Badge>
                        <span className="text-[9px] uppercase tracking-[0.1em] font-black text-muted-foreground/40 italic">
                            {petition.type?.replace('_', ' ') || 'Peça única'}
                        </span>
                    </CardFooter>
                </Card>
                );
            })}
        </div>
    )
}
