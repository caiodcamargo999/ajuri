"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRMClient } from "@/types/crm";
import { CustomTemplate } from "@/components/settings/CustomTemplateEditor";

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CustomTemplate | null;
  onGenerate: (clientData: Partial<CRMClient>, docSettings: any) => void;
}

export function CreateFromTemplateModal({
  isOpen,
  onClose,
  template,
  onGenerate,
}: CreateFromTemplateModalProps) {
  const [clientData, setClientData] = useState<Partial<CRMClient>>({
    nacionalidade: "brasileiro(a)",
  });
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  
  const [docSettings, setDocSettings] = useState({
    tipoAcao: "",
    reu: "",
    valorInicial: "",
    percentualExito: ""
  });

  const [existingClients, setExistingClients] = useState<CRMClient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("ajuri_crm_clients");
      if (stored) {
        try {
          setExistingClients(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

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

  const handleGenerate = () => {
    const fullAddress = [rua, numero].filter(Boolean).join(", ");
    
    const finalClientData = {
      ...clientData,
      address: fullAddress,
      cidade,
      estado,
    };

    onGenerate(finalClientData, docSettings);
  };

  const isFormValid = clientData.name && clientData.cpf && clientData.estadoCivil;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Preencher Dados para {template?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="font-bold text-blue-400">Dados Pessoais</h3>
            
            <div className="relative">
              <label className="text-xs font-bold text-zinc-400 uppercase">Nome Completo *</label>
              <Input 
                value={clientData.name || ""} 
                onChange={(e) => {
                  setClientData({ ...clientData, name: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Ex: João da Silva" 
                className="bg-black/50 border-white/10"
              />
              
              {showSuggestions && existingClients.filter(c => c.name?.toLowerCase().includes(clientData.name?.toLowerCase() || "")).length > 0 && (
                <div className="absolute top-[100%] left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto">
                  {existingClients
                    .filter(c => c.name?.toLowerCase().includes(clientData.name?.toLowerCase() || ""))
                    .map(c => (
                      <div 
                        key={c.id}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5"
                        onClick={() => handleSelectClient(c)}
                      >
                        <p className="font-bold text-white text-sm">{c.name}</p>
                        <p className="text-xs text-zinc-500">{c.cpf}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">CPF *</label>
                <Input value={clientData.cpf || ""} onChange={(e) => setClientData({ ...clientData, cpf: e.target.value })} className="bg-black/50 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">RG</label>
                <Input value={clientData.rg || ""} onChange={(e) => setClientData({ ...clientData, rg: e.target.value })} className="bg-black/50 border-white/10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Estado Civil *</label>
                <Select value={clientData.estadoCivil} onValueChange={(val) => setClientData({ ...clientData, estadoCivil: val })}>
                  <SelectTrigger className="bg-black/50 border-white/10 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="solteiro(a)">Solteiro(a)</SelectItem>
                    <SelectItem value="casado(a)">Casado(a)</SelectItem>
                    <SelectItem value="divorciado(a)">Divorciado(a)</SelectItem>
                    <SelectItem value="viúvo(a)">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Profissão</label>
                <Input value={clientData.profissao || ""} onChange={(e) => setClientData({ ...clientData, profissao: e.target.value })} className="bg-black/50 border-white/10" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-emerald-400">Endereço</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Rua</label>
                <Input value={rua} onChange={(e) => setRua(e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Número</label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} className="bg-black/50 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Cidade</label>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Estado (UF)</label>
                <Input value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} className="bg-black/50 border-white/10 uppercase" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-amber-400">Dados da Ação</h3>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase">Tipo de Ação</label>
              <Input value={docSettings.tipoAcao} onChange={(e) => setDocSettings({ ...docSettings, tipoAcao: e.target.value })} className="bg-black/50 border-white/10" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Réu</label>
                <Input value={docSettings.reu} onChange={(e) => setDocSettings({ ...docSettings, reu: e.target.value })} placeholder="Ex: Nome da Empresa ou Réu" className="bg-black/50 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Valor Inicial</label>
                <Input value={docSettings.valorInicial} onChange={(e) => setDocSettings({ ...docSettings, valorInicial: e.target.value })} placeholder="Ex: 5.000,00" className="bg-black/50 border-white/10" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Percentual Êxito</label>
                <Input value={docSettings.percentualExito} onChange={(e) => setDocSettings({ ...docSettings, percentualExito: e.target.value })} className="bg-black/50 border-white/10" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleGenerate} disabled={!isFormValid} className="bg-blue-600 hover:bg-blue-500 font-bold rounded-xl h-12 px-8">
              Visualizar e Gerar Petição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
