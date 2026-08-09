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
import { Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
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

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0,
        filename: `Documentos_${clientData.name?.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      await html2pdf().set(opt).from(contentRef.current).save();
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!contentRef.current) return;
    setIsDownloadingDocx(true);
    try {
      const { asBlob } = await import("html-docx-js-typescript");
      const html = contentRef.current.innerHTML;
      
      const styles = `
        <style>
          * { font-family: "Arial", sans-serif; }
          body { font-size: 12pt; line-height: 1.5; }
          .text-center { text-align: center; }
          .text-justify { text-align: justify; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-xl { font-size: 14pt; }
          .uppercase { text-transform: uppercase; }
          .indent-12 { text-indent: 2.5cm; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-8 { margin-bottom: 32px; }
          .mb-10 { margin-bottom: 40px; }
          .mb-16 { margin-bottom: 64px; }
          .mb-20 { margin-bottom: 80px; }
          .mt-10 { margin-top: 40px; }
          .mt-20 { margin-top: 80px; }
          .pt-20 { padding-top: 80px; }
          .flex, .flex-col, .items-center { text-align: center; }
          .w-96 { width: 100%; border-top: 1px solid black; margin: 0 auto; margin-bottom: 8px; }
          .border-t { border-top: 1px solid black; }
        </style>
      `;

      const finalHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${html}</body></html>`;
      
      const blob = await asBlob(finalHtml, {
        margins: { top: 1701, left: 1701, bottom: 1134, right: 1134 } // ABNT: 3cm, 3cm, 2cm, 2cm
      });
      saveAs(blob as Blob, `Documentos_${clientData.name?.replace(/\s+/g, '_')}.docx`);
      toast.success("DOCX baixado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar DOCX.");
    } finally {
      setIsDownloadingDocx(false);
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
      <DialogContent className="w-full max-w-[100vw] h-[100dvh] sm:max-w-4xl sm:h-auto sm:max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 text-white overflow-hidden p-0 sm:rounded-xl rounded-none">
        <DialogHeader className="p-4 sm:p-6 border-b border-white/10 shrink-0 bg-zinc-950/50 backdrop-blur-md overflow-x-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
              <Button
                onClick={handleDownloadDocx}
                disabled={isDownloadingDocx}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 sm:px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                {isDownloadingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">Baixar</span> DOCX
              </Button>
              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="bg-red-600 hover:bg-red-500 text-white font-bold h-10 px-4 sm:px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">Baixar</span> PDF
              </Button>
              <Button
                onClick={handleCopyText}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-4 sm:px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center w-full sm:w-auto mt-2 sm:mt-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
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
