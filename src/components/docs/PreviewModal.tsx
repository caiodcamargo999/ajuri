import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ProcuracaoTemplate } from "./templates/ProcuracaoTemplate";
import { DeclaracaoHipossuficienciaTemplate } from "./templates/DeclaracaoHipossuficienciaTemplate";
import { ContratoHonorariosTemplate } from "./templates/ContratoHonorariosTemplate";
import { CRMClient } from "@/types/crm";
import { CustomDocumentTemplate } from "./templates/CustomDocumentTemplate";

export type DocumentType = "procuracao" | "declaracao" | "contrato" | "custom" | null;

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  clientData: Partial<CRMClient>;
  docSettings?: {
    tipoAcao: string;
    reu: string;
    valorInicial: string;
    percentualExito: string;
  };
  customTemplateTitle?: string;
  customTemplateContent?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  documentType,
  clientData,
  docSettings,
  customTemplateTitle,
  customTemplateContent
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [officeData, setOfficeData] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  const getDocumentTitle = () => {
    switch (documentType) {
      case "procuracao":
        return "Procuração";
      case "declaracao":
        return "Declaração de Hipossuficiência";
      case "contrato":
        return "Contrato de Honorários";
      case "custom":
        return customTemplateTitle || "Documento Personalizado";
      default:
        return "Documento";
    }
  };

  const handleCopyText = async () => {
    if (!contentRef.current) return;
    try {
      const text = contentRef.current.innerText || contentRef.current.textContent || "";
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Texto copiado para a área de transferência!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying text:", error);
      toast.error("Erro ao copiar o texto.");
    }
  };

  const renderContent = () => {
    switch (documentType) {
      case "procuracao":
        return <ProcuracaoTemplate client={clientData} officeData={officeData} />;
      case "declaracao":
        return <DeclaracaoHipossuficienciaTemplate client={clientData} officeData={officeData} />;
      case "contrato":
        return <ContratoHonorariosTemplate client={clientData} officeData={officeData} docSettings={docSettings} />;
      case "custom":
        return <CustomDocumentTemplate client={clientData} officeData={officeData} docSettings={docSettings} templateHtml={customTemplateContent || ""} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 text-white overflow-hidden p-0">
        <DialogHeader className="p-6 border-b border-white/10 shrink-0 bg-zinc-950/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <span className="bg-amber-500/10 text-amber-500 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              Pré-visualização: {getDocumentTitle()}
            </DialogTitle>
            <Button
              onClick={handleCopyText}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Texto
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable area with dark background, centering the white document */}
        <div className="flex-1 overflow-y-auto bg-black/50 p-8 custom-scrollbar flex justify-center">
          {/* The content to be captured by html2pdf should have no outside interference. 
              We wrap it in a div that is referenced by html2pdf */}
          <div ref={contentRef} className="shadow-2xl">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
