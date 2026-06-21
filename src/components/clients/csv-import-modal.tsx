"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, Table, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react"
import Papa from "papaparse"
import { CRMClient, ClientStatus } from "@/types/crm"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface CSVImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (clients: CRMClient[]) => void
    currentPipelineId: string
    pipelines: any[]
}

type Mapping = {
    name: string
    email: string
    phone: string
    cpf: string
    value: string
}

export function CSVImportModal({ isOpen, onClose, onImport, currentPipelineId, pipelines }: CSVImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [csvData, setCsvData] = useState<any[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload")
    const [mapping, setMapping] = useState<Mapping>({
        name: "",
        email: "skip",
        phone: "skip",
        cpf: "skip",
        value: "skip"
    })
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")
    const [loading, setLoading] = useState(false)
    const [targetPipelineId, setTargetPipelineId] = useState(currentPipelineId)
    const [targetStatus, setTargetStatus] = useState<ClientStatus>("NOVO")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data.length > 0) {
                        setCsvData(results.data)
                        setHeaders(Object.keys(results.data[0] as any))
                        
                        // Auto-mapping attempt
                        const newMapping = { ...mapping }
                        const h = Object.keys(results.data[0] as any).map(h => h.toLowerCase().trim())
                        
                        h.forEach((header, idx) => {
                            const original = Object.keys(results.data[0] as any)[idx]
                            if (header.includes("nome") || header.includes("name")) newMapping.name = original
                            if (header.includes("email") || header.includes("e-mail")) newMapping.email = original
                            if (header.includes("tel") || header.includes("cel") || header.includes("phone")) newMapping.phone = original
                            if (header.includes("cpf")) newMapping.cpf = original
                            if (header.includes("valor") || header.includes("preço") || header.includes("value")) newMapping.value = original
                        })
                        setMapping(newMapping)
                        setStep("mapping")
                    } else {
                        toast.error("O arquivo CSV está vazio.")
                    }
                }
            })
        }
    }

    const handleAddTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag])
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const processImport = () => {
        if (!mapping.name) {
            toast.error("O campo 'Nome' é obrigatório no mapeamento.")
            return
        }

        setLoading(true)
        try {
            const newClients: CRMClient[] = csvData.map((row, index) => {
                return {
                    id: crypto.randomUUID(),
                    name: row[mapping.name] || "Sem Nome",
                    email: mapping.email && mapping.email !== "skip" ? row[mapping.email] : "",
                    phone: mapping.phone && mapping.phone !== "skip" ? row[mapping.phone] : "",
                    cpf: mapping.cpf && mapping.cpf !== "skip" ? row[mapping.cpf] : "",
                    status: targetStatus,
                    pipelineId: targetPipelineId,
                    createdAt: new Date().toISOString(),
                    lastUpdate: new Date().toISOString(),
                    processCount: 0,
                    activities: [{
                        id: crypto.randomUUID(),
                        type: "SYSTEM",
                        content: "Contato importado via CSV",
                        timestamp: new Date().toISOString()
                    }],
                    tasks: [],
                    tags: [...tags],
                    value: mapping.value && mapping.value !== "skip" ? parseFloat(row[mapping.value]?.replace(/[^0-9.-]+/g, "")) || 0 : 0
                }
            })

            onImport(newClients)
            toast.success(`${newClients.length} contatos importados com sucesso!`)
            reset()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao processar importação. Verifique o formato dos dados.")
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setCsvData([])
        setHeaders([])
        setStep("upload")
        setMapping({ name: "", email: "skip", phone: "skip", cpf: "skip", value: "skip" })
        setTargetPipelineId(currentPipelineId)
        setTargetStatus("NOVO")
        setTags([])
        setNewTag("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Importar Contatos</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Suba sua lista de contatos em CSV e organize-os no seu pipeline.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {step === "upload" && (
                        <div 
                            className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform">
                                <FileUp className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold">Clique para selecionar seu CSV</p>
                                <p className="text-sm text-zinc-500">ou arraste e solte o arquivo aqui</p>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".csv" 
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {step === "mapping" && (
                        <div className="space-y-6">
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-4 mb-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Destino da Importação</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Funil (Pipeline)</Label>
                                        <Select value={targetPipelineId} onValueChange={setTargetPipelineId}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-10 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                                {pipelines.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Estágio Inicial</Label>
                                        <Select value={targetStatus} onValueChange={(v: any) => setTargetStatus(v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-10 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                                <SelectItem value="NOVO">Novo Lead</SelectItem>
                                                <SelectItem value="QUALIFICACAO">Qualificação</SelectItem>
                                                <SelectItem value="APRESENTACAO">Apresentação</SelectItem>
                                                <SelectItem value="NEGOCIACAO">Negociação</SelectItem>
                                                <SelectItem value="FECHADO">Fechado 🚀</SelectItem>
                                                <SelectItem value="PERDIDO">Perdido</SelectItem>
                                                <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Nome (Obrigatório)</Label>
                                    <Select value={mapping.name} onValueChange={(v) => setMapping({ ...mapping, name: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                                            <SelectValue placeholder="Selecione a coluna" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">E-mail</Label>
                                    <Select value={mapping.email} onValueChange={(v) => setMapping({ ...mapping, email: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                                            <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="skip">Pular</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Telefone</Label>
                                    <Select value={mapping.phone} onValueChange={(v) => setMapping({ ...mapping, phone: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                                            <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="skip">Pular</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">CPF</Label>
                                    <Select value={mapping.cpf} onValueChange={(v) => setMapping({ ...mapping, cpf: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                                            <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="skip">Pular</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Valor Estimado</Label>
                                    <Select value={mapping.value} onValueChange={(v) => setMapping({ ...mapping, value: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                                            <SelectValue placeholder="Opcional" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="skip">Pular</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-900">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Marcar Tags nestes contatos</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Ex: Lead Frio, Campanha Maio..."
                                        className="bg-zinc-900 border-zinc-800 h-11"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    />
                                    <Button onClick={(e) => { e.preventDefault(); handleAddTag(); }} className="h-11 bg-zinc-800 hover:bg-zinc-700">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-1 pl-3 pr-2 gap-2">
                                            {tag}
                                            <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(tag)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    {step === "mapping" && (
                        <Button 
                            onClick={processImport} 
                            disabled={loading || !mapping.name}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Importar {csvData.length} Contatos
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
