// Types for Ajuri Calc - Bank Statement Analyzer

export interface Transaction {
  date: string;
  description: string;
  value: number;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  analyzedAt: string;
  clientName?: string;
  bankName?: string;
  period?: string;
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

// The default keywords/blacklist to identify indevid charges
export const DEFAULT_KEYWORDS: string[] = [
  "2VIA DE EXTRATO",
  "ANUIDADE",
  "CESTA",
  "COBRANÇA",
  "CONTRATAÇÃO DE CRÉDITO",
  "CONTRATAÇÃO DE LIMITE",
  "ENCARGO",
  "IOF",
  "JUROS",
  "JUROS CHEQUE",
  "MORA",
  "MULTA",
  "PAGTO ELETRON",
  "PLANO DE SAUDE",
  "RENOVAÇÃO",
  "RENDIMENTO",
  "SEGURO",
  "SERVIÇO",
  "SERVIÇOS BANCÁRIOS",
  "TAC",
  "TARIFA",
  "TARIFA CADASTRO",
  "TARIFA DOC/TED",
  "TARIFA EXTRATO",
  "TARIFA MANUTENÇÃO",
  "TAXA",
  "TD ",
  "TED ",
  "TRANSFERENCIA",
];
