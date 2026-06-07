import React from "react";
import { DocumentWrapper } from "../DocumentWrapper";
import { CRMClient } from "@/types/crm";

interface Props {
  client: Partial<CRMClient>;
  officeData?: any;
  docSettings?: {
    tipoAcao: string;
    valorInicial: string;
    percentualExito: string;
  };
}

export const ContratoHonorariosTemplate: React.FC<Props> = ({ client, officeData, docSettings }) => {
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
  } = client as any;

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
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS
        </h1>

        <p className="mb-4 text-justify">
          <strong>CONTRATANTE:</strong> {name || "___________________"}, {nacionalidade}, {estadoCivil || "___________________"}, {profissao || "___________________"}, portador(a) do RG nº {rg || "______________"} e inscrito(a) no CPF sob o nº {cpf || "______________"}, residente e domiciliado(a) na {enderecoCompleto || "_____________________________________"}.
        </p>

        <p className="text-justify mb-8 leading-relaxed">
          <strong>CONTRATADA:</strong> {officeData?.name || "____________________________________"}, inscrito na OAB/{officeData?.state || "___"} sob o nº {officeData?.oabNumbers || "______________"}, com endereço profissional na {officeData?.address || "________________________________________________"}.
        </p>

        <h2 className="font-bold mb-2">CLÁUSULA PRIMEIRA - DO OBJETO</h2>
        <p className="mb-8 text-justify indent-12 leading-relaxed">
          O presente instrumento tem como objeto a prestação de serviços advocatícios por parte da CONTRATADA ao(à) CONTRATANTE, especificamente para atuar na propositura de <strong>{docSettings?.tipoAcao || "________________________________________________"}</strong> até o trânsito em julgado.
        </p>

        <h2 className="font-bold mb-2">CLÁUSULA SEGUNDA - DOS HONORÁRIOS</h2>
        <p className="mb-8 text-justify indent-12 leading-relaxed">
          Em remuneração aos serviços profissionais ora contratados, o(a) CONTRATANTE pagará à CONTRATADA a título de honorários iniciais o valor de <strong>R$ {docSettings?.valorInicial || "______________"}</strong>, além do percentual de <strong>{docSettings?.percentualExito || "______"}%</strong> sobre o proveito econômico obtido ao final da demanda.
        </p>

        <h2 className="font-bold mb-2">CLÁUSULA TERCEIRA - DAS DESPESAS</h2>
        <p className="mb-6 indent-12 text-justify">
          Todas as despesas judiciais e extrajudiciais necessárias ao bom andamento processual, tais como custas, peritos, deslocamentos, cópias e certidões, correrão por conta exclusiva do(a) CONTRATANTE.
        </p>

        <h2 className="font-bold mb-2">CLÁUSULA QUARTA - DO FORO</h2>
        <p className="mb-16 indent-12 text-justify">
          Elegem as partes o foro da comarca de {officeData?.city || "_________________"}/{officeData?.state || "___"} para dirimir quaisquer controvérsias oriundas do presente contrato, renunciando a qualquer outro por mais privilegiado que seja.
        </p>

        <p className="text-right mb-20">
          {officeData?.city || "_________________"} - {officeData?.state || "___"}, {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}.
        </p>

        <div className="flex flex-col md:flex-row justify-between mt-20 gap-10">
          <div className="flex flex-col items-center flex-1">
            <div className="w-full border-t border-black mb-2"></div>
            <p className="font-bold text-center">{name || "________________________________"}</p>
            <p className="text-sm">CONTRATANTE</p>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-full border-t border-black pt-2 text-center text-sm font-bold uppercase">
              {officeData?.name || "________________________________"}
              <div className="font-normal text-xs normal-case">CONTRATADO(A)</div>
            </div>
          </div>
        </div>
      </div>
    </DocumentWrapper>
  );
};
