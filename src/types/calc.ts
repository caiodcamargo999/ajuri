// Types for Ajuri Calc - Bank Statement Analyzer

export interface Transaction {
  date: string;
  description: string;
  value: number;
  action?: string; // Ação classificada conforme o modelo oficial (ex: SEGURO, CESTA, MORA, PARCELA CRED)
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  analyzedAt: string;
  clientName?: string;
  bankName?: string;
  period?: string;
  origem?: string;
  responsavel?: string;
  status?: string;
  transactions: Transaction[];
  totalDebits: number;
  keywordsUsed: string[];
  notes?: string;
}

export type DateLayout = "header" | "inline";

export interface CalcSettings {
  keywords: string[];
  dateLayout: DateLayout;
}

// Palavras-chave padrão baseadas no modelo oficial da PLANILHA DE NOVAS AÇÕES
export const DEFAULT_KEYWORDS: string[] = [
  "2VIA DE EXTRATO",
  "ADEP",
  "ADIANT DEPOSITANTE",
  "ADIANTAMENTO",
  "ANP",
  "ANUIDADE",
  "APLIC",
  "APLIC INVEST",
  "ASPECIR",
  "ASSISTENCIA",
  "ASSINATURA",
  "AVALIAÇÃO",
  "AVERBAÇÃO",
  "AVERB",
  "BLOQUEIO",
  "BONIFICADA",
  "BX",
  "BX ANT",
  "CADASTRO",
  "CAP PIC",
  "CAPITALIZAÇÃO",
  "CARTAO PROTEGIDO",
  "CESTA",
  "CHUBB",
  "COBRANÇA",
  "COMBINAQUI",
  "CONTRATAÇÃO",
  "DEBITO AUTORIZADO",
  "DESCONTO",
  "DOC",
  "EMISSÃO EXTRATO",
  "EMPRÉSTIMO",
  "ENCARGO",
  "ENCARGOS",
  "EXTRATO",
  "FATURA PROTEGIDA",
  "GASTO CARTAO",
  "GASTOS CARTAO",
  "GOLPE",
  "IOF",
  "JUROS",
  "LIMITE",
  "MAXIC",
  "MENSAL",
  "MENSALIDADE",
  "MORA",
  "MULTA",
  "ODONTO",
  "PACOTE",
  "PADRONIZADO",
  "PARC AUTOMATICO",
  "PARC CRED",
  "PARC FACIL",
  "PARCELA CRED",
  "PARCELAMENTO",
  "PAGTO ELETRON",
  "PLANO DE SAUDE",
  "PRESTAMISTA",
  "PREVISUL",
  "RCC",
  "REFINANCIAMENTO",
  "REGISTRO",
  "RENOVAÇÃO",
  "RMC",
  "SAQUE TERMINAL",
  "SAQUETERMINAL",
  "SEGURO",
  "SERVIÇO",
  "SERVIÇOS BANCÁRIOS",
  "SMS",
  "SUPERPROTEGIDO",
  "TAC",
  "TARIFA",
  "TAR ",
  "TAXA",
  "TD ",
  "TED",
  "TITULO DE CAP",
  "TITULO CAPITALIZAÇÃO",
  "TRANSFERENCIA",
  "VENDA CASADA",
  "VIDA E PREV",
];
