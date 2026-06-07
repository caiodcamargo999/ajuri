import React from "react";
import { DocumentWrapper } from "../DocumentWrapper";
import { CRMClient } from "@/types/crm";

interface Props {
  client: Partial<CRMClient>;
  officeData?: any;
}

export const ProcuracaoTemplate: React.FC<Props> = ({ client, officeData }) => {
  const {
    name,
    cpf,
    rg,
    nacionalidade = "brasileiro(a)",
    estadoCivil,
    profissao,
    address,
    bairro,
    cidade,
    estado,
    cep,
  } = client as any; // Using any as cidade and estado are not directly in CRMClient but requested

  const enderecoCompleto = [
    address,
    bairro ? `Bairro ${bairro}` : "",
    cidade ? cidade : "",
    estado ? estado : "",
    cep ? `CEP ${cep}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <DocumentWrapper>
      <div className="pt-20">
        <h1 className="text-center font-bold text-xl mb-10 uppercase">
          PROCURAÇÃO “AD JUDICIA ET EXTRA”
        </h1>

        <p className="mb-4 text-justify">
          <strong>OUTORGANTE:</strong> {name || "___________________"}, {nacionalidade}, {estadoCivil || "___________________"}, {profissao || "___________________"}, portador(a) do RG nº {rg || "______________"} e inscrito(a) no CPF sob o nº {cpf || "______________"}, residente e domiciliado(a) na {enderecoCompleto || "_____________________________________"}.
        </p>

        <p className="mb-8 indent-12 text-justify">
          <strong>OUTORGADO:</strong> {officeData?.name || "____________________________________"}, inscrito(a) na OAB/{officeData?.state || "___"} sob o nº {officeData?.oabNumbers || "______________"}, com endereço profissional na {officeData?.address || "________________________________________________"}, onde recebe intimações e notificações.
        </p>

        <p className="mb-6 indent-12 text-justify">
          <strong>PODERES:</strong> Pelo presente instrumento de mandato, o(a) OUTORGANTE nomeia e constitui seu(s) bastante procurador(es) o(s) OUTORGADO(S), conferindo-lhe(s) amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, bem como fora deles, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os.
        </p>

        <p className="mb-16 indent-12 text-justify">
          <strong>PODERES ESPECÍFICOS:</strong> Confere, ainda, poderes especiais para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromisso, assinar declaração de hipossuficiência econômica e substabelecer, com ou sem reserva de poderes.
        </p>

        <p className="text-right mb-20">
          {officeData?.city || "_________________"} - {officeData?.state || "___"}, {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}.
        </p>

        <div className="flex flex-col items-center mt-20">
          <div className="w-96 border-t border-black mb-2"></div>
          <p className="font-bold">{name || "________________________________"}</p>
          <p className="text-sm">OUTORGANTE</p>
        </div>
      </div>
    </DocumentWrapper>
  );
};
