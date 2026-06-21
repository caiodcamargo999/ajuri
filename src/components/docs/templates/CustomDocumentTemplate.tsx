import React from "react";
import { CRMClient } from "@/types/crm";

interface CustomDocumentTemplateProps {
  client: Partial<CRMClient>;
  officeData: any;
  docSettings?: {
    tipoAcao: string;
    reu: string;
    valorInicial: string;
    percentualExito: string;
  };
  templateHtml: string;
}

export const CustomDocumentTemplate: React.FC<CustomDocumentTemplateProps> = ({
  client,
  officeData,
  docSettings,
  templateHtml,
}) => {
  // Replace variables in HTML
  const replaceVariables = (html: string) => {
    let newHtml = html;
    
    // Client data
    newHtml = newHtml.replace(/\{\{NOME_CLIENTE\}\}/g, client.name || "________________");
    newHtml = newHtml.replace(/\{\{CPF\}\}/g, client.cpf || "________________");
    newHtml = newHtml.replace(/\{\{RG\}\}/g, client.rg || "________________");
    newHtml = newHtml.replace(/\{\{ESTADO_CIVIL\}\}/g, client.estadoCivil || "________________");
    newHtml = newHtml.replace(/\{\{PROFISSAO\}\}/g, client.profissao || "________________");
    newHtml = newHtml.replace(/\{\{ENDERECO_COMPLETO\}\}/g, client.address || "________________");
    
    // Doc settings
    newHtml = newHtml.replace(/\{\{TIPO_ACAO\}\}/g, docSettings?.tipoAcao || "________________");
    newHtml = newHtml.replace(/\{\{VALOR_INICIAL\}\}/g, docSettings?.valorInicial || "________________");
    newHtml = newHtml.replace(/\{\{REU\}\}/g, docSettings?.reu || "________________");
    newHtml = newHtml.replace(/\{\{PERCENTUAL_EXITO\}\}/g, docSettings?.percentualExito || "________________");
    // Remove any remaining square brackets
    newHtml = newHtml.replace(/[\[\]]/g, "");
    
    return newHtml;
  };

  const finalHtml = replaceVariables(templateHtml || "");

  return (
    <div className="bg-white text-black p-12 md:p-20 min-h-[1123px] w-full max-w-[794px] mx-auto shadow-2xl relative"
         style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      
      {/* TIMBRE / CABEÇALHO */}
      <div className="flex justify-center mb-12">
        {officeData?.logoImage ? (
          <img src={officeData.logoImage} alt="Logo do Escritório" className="h-24 object-contain" />
        ) : (
          <div className="h-24 flex items-center justify-center">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-800">
              {officeData?.name || "NOME DO ESCRITÓRIO"}
            </h1>
          </div>
        )}
      </div>

      <div className="space-y-6 text-[11pt] leading-relaxed text-justify mb-16">
         {/* User's Custom Content is injected here */}
         <div dangerouslySetInnerHTML={{ __html: finalHtml }} className="prose prose-sm max-w-none custom-template-content" />
      </div>

      {/* RODAPÉ */}
      <div className="absolute bottom-12 left-0 right-0 px-20">
        <div className="border-t border-zinc-300 pt-4 flex justify-between items-end">
          <div className="text-[9pt] text-zinc-500">
            <p className="font-bold text-zinc-800">{officeData?.name || "NOME DO ESCRITÓRIO"}</p>
            <p>OAB: {officeData?.oabNumbers || "XX.XXX"}</p>
          </div>
          <div className="text-[9pt] text-zinc-500 text-right">
            <p>{officeData?.address || "ENDEREÇO AQUI"}</p>
            <p>{officeData?.phone || "(00) 00000-0000"} | {officeData?.email || "email@escritorio.com"}</p>
          </div>
        </div>
      </div>
      
      {/* Required CSS to make sure list styles show up inside the custom template content */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-template-content ul { list-style-type: disc; padding-left: 1.5rem; }
        .custom-template-content ol { list-style-type: decimal; padding-left: 1.5rem; }
        .custom-template-content li { margin-bottom: 0.25rem; }
        .custom-template-content p { margin-bottom: 1rem; }
        .custom-template-content h1, .custom-template-content h2, .custom-template-content h3 { font-weight: bold; margin-bottom: 1rem; margin-top: 1.5rem; }
      `}} />
    </div>
  );
};
