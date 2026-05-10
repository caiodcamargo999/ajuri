"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { ArrowRight, Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const templates = [
    {
        id: "tarifas-bancarias",
        title: "Tarifas Bancárias",
        description: "Ação declaratória de inexistência de débito c/c repetição de indébito e danos morais para cobranças indevidas em conta corrente.",
        tags: ["Bancário", "Consumidor"],
        content_summary: "Modelo completo para revisão de tarifas.",
        active: true,
    },
    {
        id: "seguro-contrato-veiculos",
        title: "Seguro Contrato de Veículos",
        description: "Ação de inexigibilidade de seguro c/c danos materiais e morais por venda casada de seguro em contrato de financiamento de veículo.",
        tags: ["Bancário", "Consumidor"],
        content_summary: "Modelo para cancelamento de seguro embutido em financiamento de veículo.",
        active: true,
    },
    {
        id: "rmc",
        title: "Cartão de Crédito RMC",
        description: "Anulação de Reserva de Margem Consignável (RMC) indevida em benefício previdenciário com pedido de indenização.",
        tags: ["Consumidor", "Idoso"],
        content_summary: "Petição inicial para casos de RMC não solicitado.",
        active: false,
    },
    {
        id: "atraso-voo",
        title: "Atraso/Cancelamento de Voo",
        description: "Ação indenizatória por danos morais e materiais decorrentes de atraso superior a 4 horas ou cancelamento de voo.",
        tags: ["Cível", "Aéreo"],
        content_summary: "Indenização por danos morais e materiais em voos.",
        active: false,
    },
    {
        id: "plano-saude-cirurgia",
        title: "Negativa de Cirurgia/Home Care",
        description: "Obrigação de fazer com pedido de tutela de urgência para liberar cirurgia, medicamento ou home care negado pelo plano.",
        tags: ["Saúde", "Liminar"],
        content_summary: "Tutela de urgência para saúde.",
        active: false,
    },
    {
        id: "divorcio-consensual",
        title: "Divórcio Consensual",
        description: "Petição inicial para divórcio amigável, com ou sem partilha de bens e guarda de menores, pronta para homologação.",
        tags: ["Família", "Civil"],
        content_summary: "Minuta de acordo de divórcio.",
        active: false,
    },
    {
        id: "usucapiao-extrajudicial",
        title: "Usucapião Extrajudicial",
        description: "Requerimento para reconhecimento de propriedade via cartório, conforme Provimento 65/CNJ.",
        tags: ["Imobiliário", "Cartório"],
        content_summary: "Requerimento para cartório.",
        active: false,
    },
    {
        id: "golpe-pix",
        title: "Golpe do Pix",
        description: "Ação de restituição de valores contra o banco por falha na segurança (Súmula 479 STJ) e mecanismos anti-fraude.",
        tags: ["Bancário", "Fraude"],
        content_summary: "Ação de restituição para golpes digitais.",
        active: false,
    },
    {
        id: "liminar-concurso",
        title: "Mandado de Segurança (Concurso)",
        description: "Peça para anulação de questões ou garantia de nomeação de candidato aprovado dentro das vagas.",
        tags: ["Administrativo", "Concurso"],
        content_summary: "MS para concursos públicos.",
        active: false,
    },
    {
        id: "multa-transito",
        title: "Defesa de Autuação/Suspensão CNH",
        description: "Recurso administrativo ou judicial para anulação de multas e processos de suspensão do direito de dirigir.",
        tags: ["Trânsito", "Administrativo"],
        content_summary: "Defesa prévia e recurso JARI.",
        active: false,
    },
]

const activeTemplates = templates.filter(t => t.active)

export function TemplateGrid() {
    const [selectedTemplate, setSelectedTemplate] = useState<typeof activeTemplates[0] | null>(null)
    const [creating, setCreating] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleCreatePetition = async () => {
        if (!selectedTemplate) return
        setCreating(true)

        const petitionData = {
            id: crypto.randomUUID(),
            title: selectedTemplate.title,
            status: 'draft',
            type: 'template_based',
            updated_at: new Date().toISOString(),
        }

        try {
            // First save to LocalStorage for instant feedback (UI fallback)
            const stored = localStorage.getItem("ajuri_petitions_history");
            const history = stored ? JSON.parse(stored) : [];
            localStorage.setItem("ajuri_petitions_history", JSON.stringify([petitionData, ...history]));

            // Try to save to Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('petitions').insert({
                    user_id: user.id,
                    title: petitionData.title,
                    status: petitionData.status,
                    content: { summary: selectedTemplate.content_summary, template_id: selectedTemplate.id },
                    type: petitionData.type
                });
            }

            toast.success("Petição criada com sucesso! Veja em 'Minhas Petições'.")
            setSelectedTemplate(null)

            // Dispatch custom event to notify MyPetitionsList if it's on the same page
            window.dispatchEvent(new Event('petitions-updated'));

        } catch (error: any) {
            console.error("Error creating petition", error);
            toast.error("Petição salva localmente (Erro ao sincronizar com nuvem).");
        } finally {
            setCreating(false)
        }
    }

    return (
        <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {activeTemplates.map((template) => (
                    <Card key={template.id} className="group flex flex-col hover:border-primary/50 transition-all hover:shadow-md border-border/50 bg-card/30">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-1.5 flex-wrap">
                                    {template.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-[10px] uppercase font-bold tracking-tight bg-primary/5 text-primary border-primary/20">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{template.title}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px] text-sm leading-relaxed">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground p-3 bg-muted/40 rounded-xl border border-dashed border-border/60">
                                <Info className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                <span>Modelo otimizado com jurisprudência atualizada 2024.</span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button className="w-full gap-2 rounded-xl group-hover:shadow-lg group-hover:shadow-primary/10 transition-all" onClick={() => setSelectedTemplate(template)}>
                                Usar Modelo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                <DialogContent className="rounded-2xl sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Confirmar Escolha</DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Você iniciará um novo rascunho: <br />
                            <span className="font-bold text-foreground">"{selectedTemplate?.title}"</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4 py-1 italic">
                            {selectedTemplate?.content_summary}
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setSelectedTemplate(null)} disabled={creating} className="rounded-xl">Cancelar</Button>
                        <Button onClick={handleCreatePetition} disabled={creating} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : "Criar Petição"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
