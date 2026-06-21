"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CRMClient } from "@/types/crm"
import { FileText, MapPin, User, FileSignature, Scale, Building2, Sparkles, Loader2 } from "lucide-react"
import { PreviewModal, DocumentType } from "@/components/docs/PreviewModal"
import { CustomTemplate, STORAGE_KEY_TEMPLATES } from "@/components/settings/CustomTemplateEditor"
import { toast } from "sonner"
import { ProcuracaoTemplate } from "@/components/docs/templates/ProcuracaoTemplate"
import { DeclaracaoHipossuficienciaTemplate } from "@/components/docs/templates/DeclaracaoHipossuficienciaTemplate"
import { ContratoHonorariosTemplate } from "@/components/docs/templates/ContratoHonorariosTemplate"

const STORAGE_KEY = "ajuri_crm_clients"

export default function DocsPage() {
  const [clientData, setClientData] = useState<Partial<CRMClient>>({
    nacionalidade: "brasileiro(a)",
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(null);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<CustomTemplate | null>(null);
  const [existingClients, setExistingClients] = useState<CRMClient[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [officeData, setOfficeData] = useState<any>(null);


  // Form Fields State for those not directly matching CRMClient perfectly
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Specific document fields
  const [docSettings, setDocSettings] = useState({
    tipoAcao: "",
    reu: "",
    valorInicial: "",
    percentualExito: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExistingClients(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    const storedTemplates = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (storedTemplates) {
      try {
        setCustomTemplates(JSON.parse(storedTemplates));
      } catch (e) {
        console.error(e);
      }
    }

    // Load officeData
    try {
      const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
      const activeId = localStorage.getItem("ajuri_active_profile_id");
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        const activeProfile = profiles.find((p: any) => p.id === activeId) || profiles[0];
        if (activeProfile?.officeData) {
          setOfficeData(activeProfile.officeData);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSelectClient = (client: CRMClient) => {
    setClientData({
      name: client.name || "",
      cpf: client.cpf || "",
      rg: client.rg || "",
      nacionalidade: client.nacionalidade || "brasileiro(a)",
      estadoCivil: client.estadoCivil || "",
      profissao: client.profissao || "",
      bairro: client.bairro || "",
      cep: client.cep || "",
    });
    
    if (client.address) {
      const parts = client.address.split(",");
      setRua(parts[0]?.trim() || "");
      if (parts.length > 1) {
        setNumero(parts[1]?.trim() || "");
      }
    } else {
      setRua("");
      setNumero("");
    }

    const anyClient = client as any;
    if (anyClient.cidade) setCidade(anyClient.cidade);
    else setCidade("");

    if (anyClient.estado) setEstado(anyClient.estado);
    else setEstado("");

    setShowSuggestions(false);
  };

  const isFormValid = clientData.name && clientData.cpf && clientData.estadoCivil && docSettings.tipoAcao && docSettings.reu && docSettings.valorInicial && docSettings.percentualExito;

  const handleOpenPreview = (type: DocumentType) => {
    // 1. Build the full address to save
    const fullAddress = [rua, numero].filter(Boolean).join(", ");
    
    const finalClientData = {
      ...clientData,
      address: fullAddress,
      cidade,
      estado,
    };

    setClientData(finalClientData);
    
    // 2. Save client if not exists
    saveClientIfNeeded(finalClientData as CRMClient);

    // 3. Open Modal
    setSelectedDocType(type);
    setSelectedCustomTemplate(null);
    setModalOpen(true);
  };

  const handleOpenCustomPreview = (template: CustomTemplate) => {
    // 1. Build the full address to save
    const fullAddress = [rua, numero].filter(Boolean).join(", ");
    
    const finalClientData = {
      ...clientData,
      address: fullAddress,
      cidade,
      estado,
    };

    setClientData(finalClientData);
    saveClientIfNeeded(finalClientData as CRMClient);

    setSelectedDocType("custom");
    setSelectedCustomTemplate(template);
    setModalOpen(true);
  };

  const saveClientIfNeeded = (client: CRMClient) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let clients: CRMClient[] = [];
    if (stored) {
      try {
        clients = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }

    // Check by CPF (or Name as fallback)
    const exists = clients.some((c) => (c.cpf && c.cpf === client.cpf) || (c.name === client.name));
    
    if (!exists && client.name) {
      const newClient: CRMClient = {
        ...client,
        id: crypto.randomUUID(),
        status: "NOVO",
        pipelineId: "default",
        activities: [],
        tasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        processCount: 0,
      } as CRMClient;
      
      clients.push(newClient);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    }
  };

  return (
    <div className="flex flex-1 flex-col animate-in fade-in duration-300 bg-black min-h-screen relative w-full">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 p-4 md:p-8 relative z-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <FileSignature className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-none">
                Docs Jurídicos
              </h1>
              <p className="text-zinc-500 font-medium mt-1">
                Gere documentos pré-formatados com a identidade do escritório.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Pessoais Card */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
            
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-medium tracking-tight text-foreground">Dados Pessoais</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Nome Completo *</label>
                <Input 
                  value={clientData.name || ""} 
                  onChange={(e) => {
                    setClientData({ ...clientData, name: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ex: João da Silva" 
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                />
                
                {showSuggestions && existingClients.filter(c => c.name?.toLowerCase().includes(clientData.name?.toLowerCase() || "")).length > 0 && (
                  <div className="absolute top-[100%] left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {existingClients
                      .filter(c => c.name?.toLowerCase().includes(clientData.name?.toLowerCase() || ""))
                      .map(c => (
                        <div 
                          key={c.id}
                          className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                          onClick={() => handleSelectClient(c)}
                        >
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-xs text-zinc-500">{c.cpf ? `CPF: ${c.cpf}` : "Sem CPF"} • {c.email || "Sem email"}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">CPF *</label>
                  <Input 
                    value={clientData.cpf || ""} 
                    onChange={(e) => setClientData({ ...clientData, cpf: e.target.value })}
                    placeholder="000.000.000-00" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">RG</label>
                  <Input 
                    value={clientData.rg || ""} 
                    onChange={(e) => setClientData({ ...clientData, rg: e.target.value })}
                    placeholder="00.000.000-X" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Nacionalidade</label>
                  <Input 
                    value={clientData.nacionalidade || ""} 
                    onChange={(e) => setClientData({ ...clientData, nacionalidade: e.target.value })}
                    placeholder="brasileiro(a)" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Estado Civil *</label>
                  <Select 
                    value={clientData.estadoCivil} 
                    onValueChange={(val) => setClientData({ ...clientData, estadoCivil: val })}
                  >
                    <SelectTrigger className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectItem value="solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="união estável">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Profissão</label>
                <Input 
                  value={clientData.profissao || ""} 
                  onChange={(e) => setClientData({ ...clientData, profissao: e.target.value })}
                  placeholder="Ex: Engenheiro(a)" 
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Endereço Card */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
            
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-medium tracking-tight text-foreground">Endereço</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Rua / Logradouro</label>
                  <Input 
                    value={rua} 
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Ex: Av. Paulista" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Número</label>
                  <Input 
                    value={numero} 
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="1000" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Bairro</label>
                  <Input 
                    value={clientData.bairro || ""} 
                    onChange={(e) => setClientData({ ...clientData, bairro: e.target.value })}
                    placeholder="Centro" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">CEP</label>
                  <Input 
                    value={clientData.cep || ""} 
                    onChange={(e) => setClientData({ ...clientData, cep: e.target.value })}
                    placeholder="00000-000" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Cidade</label>
                  <Input 
                    value={cidade} 
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">UF</label>
                  <Input 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="SP" 
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50 uppercase"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Specific Info Card - Moved above buttons */}
        <Card className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50 group-hover:bg-amber-400 transition-colors" />
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-medium tracking-tight text-foreground">Informações Específicas do Documento</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Estes dados serão usados para preencher as cláusulas de Objeto, Réu e Honorários de Êxito.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Objeto / Tipo de Ação ou Serviço *</label>
              <Input 
                value={docSettings.tipoAcao} 
                onChange={(e) => setDocSettings({ ...docSettings, tipoAcao: e.target.value })}
                placeholder="Ex: Ação de Indenização por Danos Morais" 
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Réu *</label>
                <Input 
                  value={docSettings.reu} 
                  onChange={(e) => setDocSettings({ ...docSettings, reu: e.target.value })}
                  placeholder="Ex: Nome da Empresa ou Réu" 
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Honorários Iniciais (R$) *</label>
                <Input 
                  value={docSettings.valorInicial} 
                  onChange={(e) => setDocSettings({ ...docSettings, valorInicial: e.target.value })}
                  placeholder="Ex: 5.000,00" 
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Percentual no Êxito (%) *</label>
                <Input 
                  value={docSettings.percentualExito} 
                  onChange={(e) => setDocSettings({ ...docSettings, percentualExito: e.target.value })}
                  placeholder="Ex: 30" 
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-lg font-medium tracking-tight text-foreground mb-6 text-center">Selecione o Documento para Gerar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Button
              disabled={!isFormValid}
              onClick={() => handleOpenPreview("procuracao")}
              className="h-16 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 rounded-2xl font-bold transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scale className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Gerar Procuração
            </Button>
            
            <Button
              disabled={!isFormValid}
              onClick={() => handleOpenPreview("declaracao")}
              className="h-16 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-500 rounded-2xl font-bold transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Gerar Declaração
            </Button>

            <Button
              disabled={!isFormValid}
              onClick={() => handleOpenPreview("contrato")}
              className="h-16 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 hover:border-amber-500 rounded-2xl font-bold transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Building2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Gerar Contrato
            </Button>

            {customTemplates.map((template) => (
              <Button
                key={template.id}
                disabled={!isFormValid}
                onClick={() => handleOpenCustomPreview(template)}
                className="h-16 bg-zinc-600/20 hover:bg-zinc-600 text-zinc-400 hover:text-white border border-zinc-500/30 hover:border-zinc-500 rounded-2xl font-bold transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                {template.title}
              </Button>
            ))}
          </div>

          {!isFormValid && (
            <p className="text-center text-sm text-zinc-500 mt-4">
              * Preencha todos os campos obrigatórios acima para habilitar a geração.
            </p>
          )}
        </div>
      </div>

      <PreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        documentType={selectedDocType}
        clientData={{
          ...clientData,
          address: `${rua}${numero ? `, ${numero}` : ""}${clientData.bairro ? `, ${clientData.bairro}` : ""}${cidade ? `, ${cidade}` : ""}${estado ? ` - ${estado}` : ""}`
        }}
        docSettings={docSettings}
        customTemplateTitle={selectedCustomTemplate?.title}
        customTemplateContent={selectedCustomTemplate?.content}
      />


    </div>
  )
}
