export interface ClientData {
  name: string;
  nationality: string;
  civilStatus: string;
  profession: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  street: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  // Novo campo para comarca
  comarca: string;
}

export interface BankData {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  cep: string;
}

export interface ChargeItem {
  id: string;
  date: string;
  description: string;
  value: number;
  screenshot?: string; // Base64 image data
}

export interface OfficeData {
  name: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  oabNumbers?: string;
  secondaryAddress?: string;
  primaryColor?: string;
  waInstanceName?: string;
  waToken?: string;
}

export interface BrandingProfile {
  id: string;
  profileName: string;
  officeData: OfficeData;
  logoImage: string | null;
  headerImage: string | null;
  createdAt: string;
}

export interface PetitionData {
  client: ClientData;
  bank: BankData;
  petitionType: PetitionType;
  chargeDescription: string; // Rubrica selecionada
  charges: ChargeItem[];
  moralDamage: number;
  wastedTimeDamage: number;
  dateOfPetition: string;
  chargeScreenshots: string[]; // Array of base64 images
}

export const EMPTY_OFFICE: OfficeData = {
  name: '',
  address: '',
  cep: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  website: '',
  oabNumbers: '',
  secondaryAddress: '',
};

export const DEFAULT_OFFICE: OfficeData = {
  name: 'Seu Nome ou Nome do Escritório',
  address: 'Rua, Número, Bairro',
  cep: '00000-000',
  city: 'Cidade',
  state: 'Estado',
  phone: '(00) 00000-0000',
  email: 'seu@email.com',
  website: 'www.seusite.com',
  oabNumbers: 'OAB/UF 00.000',
  secondaryAddress: '',
  primaryColor: '#10b981',
};

export type PetitionType =
  | 'TARIFAS_INDEVIDAS'
  | 'RMC'
  | 'ATRASO_VOO'
  | 'SAUDE_CIRURGIA'
  | 'DIVORCIO_CONSENSUAL'
  | 'USUCAPIAO_EXTRAJUDICIAL'
  | 'GOLPE_PIX'
  | 'MS_CONCURSO'
  | 'MULTA_TRANSITO';

export const PETITION_TYPE_LABELS: Record<PetitionType, string> = {
  TARIFAS_INDEVIDAS: 'Tarifas Indevidas',
  RMC: 'Cartão de Crédito RMC',
  ATRASO_VOO: 'Atraso/Cancelamento de Voo',
  SAUDE_CIRURGIA: 'Negativa de Cirurgia/Home Care',
  DIVORCIO_CONSENSUAL: 'Divórcio Consensual',
  USUCAPIAO_EXTRAJUDICIAL: 'Usucapião Extrajudicial',
  GOLPE_PIX: 'Golpe do Pix',
  MS_CONCURSO: 'Mandado de Segurança (Concurso)',
  MULTA_TRANSITO: 'Multa de Trânsito',
};

export const BANKS: BankData[] = [
  {
    name: 'BANCO BRADESCO S/A',
    cnpj: '60.746.948/0001-12',
    address: 'Núcleo Cidade de Deus, s/nº, Vila Yara',
    city: 'Osasco',
    state: 'SP',
    cep: '06.029-900',
  },
  {
    name: 'ITAÚ UNIBANCO S/A',
    cnpj: '60.701.190/0001-04',
    address: 'Praça Alfredo Egydio de Souza Aranha, 100',
    city: 'São Paulo',
    state: 'SP',
    cep: '04344-902',
  },
  {
    name: 'BANCO DO BRASIL S/A',
    cnpj: '00.000.000/0001-91',
    address: 'SBS Quadra 1, Bloco G, Lote 32',
    city: 'Brasília',
    state: 'DF',
    cep: '70073-901',
  },
  {
    name: 'CAIXA ECONÔMICA FEDERAL',
    cnpj: '00.360.305/0001-04',
    address: 'SBS Quadra 4, Lote 3/4',
    city: 'Brasília',
    state: 'DF',
    cep: '70092-900',
  },
  {
    name: 'BANCO SANTANDER (BRASIL) S/A',
    cnpj: '90.400.888/0001-42',
    address: 'Avenida Presidente Juscelino Kubitschek, 2041',
    city: 'São Paulo',
    state: 'SP',
    cep: '04543-011',
  },
  {
    name: 'BANCO BMG S/A',
    cnpj: '61.186.680/0001-74',
    address: 'Avenida Álvares Cabral, 1707',
    city: 'Belo Horizonte',
    state: 'MG',
    cep: '30170-001',
  },
  {
    name: 'BANCO PAN S/A',
    cnpj: '59.285.411/0001-13',
    address: 'Avenida Paulista, 1374',
    city: 'São Paulo',
    state: 'SP',
    cep: '01310-916',
  },
  {
    name: 'BANCO C6 S/A',
    cnpj: '31.872.495/0001-72',
    address: 'Avenida Nove de Julho, 3186',
    city: 'São Paulo',
    state: 'SP',
    cep: '01406-000',
  },
];

export const CIVIL_STATUS_OPTIONS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
];

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
