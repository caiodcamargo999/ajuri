import React from "react";
import { DocumentWrapper } from "../DocumentWrapper";
import { CRMClient } from "@/types/crm";

interface Props {
  client: Partial<CRMClient>;
  officeData?: any;
}

export const DeclaracaoHipossuficienciaTemplate: React.FC<Props> = ({ client, officeData }) => {
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
          DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA
        </h1>

        <p className="mb-8 text-justify leading-relaxed indent-12">
          Eu, <strong>{name || "___________________"}</strong>, {nacionalidade}, {estadoCivil || "___________________"}, {profissao || "___________________"}, portador(a) do RG nº {rg || "______________"} e inscrito(a) no CPF sob o nº {cpf || "______________"}, residente e domiciliado(a) na {enderecoCompleto || "_____________________________________"}, <strong>DECLARO</strong>, sob as penas da lei, para os devidos fins de direito, que não possuo condições financeiras de arcar com o pagamento das custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.
        </p>

        <p className="mb-16 indent-12 text-justify">
          Por ser a expressão da verdade, firmo a presente declaração, ciente das sanções civis, administrativas e criminais previstas em lei para o caso de falsidade.
        </p>

        <p className="text-right mb-20">
          {officeData?.city || "_________________"} - {officeData?.state || "___"}, {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}.
        </p>

        <div className="flex flex-col items-center mt-20">
          <div className="w-96 border-t border-black mb-2"></div>
          <p className="font-bold">{name || "________________________________"}</p>
          <p className="text-sm">DECLARANTE</p>
        </div>
      </div>
    </DocumentWrapper>
  );
};
