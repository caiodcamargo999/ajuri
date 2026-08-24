export const RUBRICAS = [
    // Top Ações da Planilha de Novas Ações
    "SEGURO",
    "SEGURO PRESTAMISTA",
    "SEGURO CARTÃO / BOLSA PROTEGIDA",
    "SEGURO SUPERPROTEGIDO",
    "SEGURO DE VIDA E PREVIDÊNCIA",
    "SEGURO RESIDENCIAL",
    "SEGURO ACIDENTES PESSOAIS",
    "SEGURO DESEMPREGO",
    "ASPECIR - UNIÃO SEGURADORA",
    "ANUIDADE DE CARTÃO DE CRÉDITO",
    "ANUIDADE DIFERENCIADA",
    "PARCELA CRÉDITO (PARC CRED)",
    "PARCELAMENTO FÁCIL (PARC FACIL)",
    "PARCELAMENTO AUTOMÁTICO DE FATURA",
    "MORA E ENCARGOS",
    "MORA DE CRÉDITO PESSOAL (MORA CRED)",
    "CESTA BÁSICA DE SERVIÇOS",
    "CESTA UNIVERSITÁRIA",
    "CESTA B.EXPRESSO",
    "MENSAL COMBINAQUI",
    "JUROS ABUSIVOS",
    "JUROS DE CHEQUE ESPECIAL",
    "JUROS NO CONTRATO DE FINANCIAMENTO",
    "RMC - RESERVA DE MARGEM CONSIGNÁVEL",
    "RCC - RESERVA DE CARTÃO CONSIGNADO",
    "AVERBAÇÃO INDEVIDA",
    "APLIC / APLICAÇÃO FINANCEIRA AUTOMÁTICA",
    "ENCARGOS DE CONTA / LIMITE DE CRÉDITO",
    "GASTOS DE CARTÃO DE CRÉDITO NÃO RECONHECIDOS",
    "PACOTE DE SERVIÇOS PADRONIZADOS",
    "PACOTE DE TARIFAS (TAR MAXIC)",
    "BX - BAIXA INDEVIDA DE CONTRATO",
    "TÍTULO DE CAPITALIZAÇÃO (CAP PIC)",
    "FATURA PROTEGIDA",
    "TARIFA DE CADASTRO (CONFECÇÃO DE CADASTRO)",
    "TARIFA DE AVALIAÇÃO DE BENS",
    "REGISTRO DE CONTRATO",
    "TARIFA DE ADIANTAMENTO DE DEPOSITANTE (ADEP)",
    "TARIFA DE SAQUE TERMINAL / CORRESPONDENTE",
    "FACILIDADE SMS PLUS / SMS CONTROLE",
    "COBRANÇA INDEVIDA",
    "DÉBITO NÃO AUTORIZADO",
    "VENDA CASADA DE SEGUROS E PRODUTOS",
    "GOLPE DO PIX / FRAUDE BANCÁRIA",
    "EMPRÉSTIMO NÃO CONTRATADO",
    "REFINANCIAMENTO NÃO AUTORIZADO",
    "BLOQUEIO INDEVIDO DE VALOR / CONTA",
    "TARIFA DE MANUTENÇÃO DE CONTA",
    "TARIFA DE EMISSÃO DE EXTRATO",
    "TARIFA DOC/TED",
    "TARIFA BONIFICADA",
    "ASSINATURA DE SERVIÇOS DIGITAIS",
    "MENSALIDADE DE ASSOCIAÇÃO / CLUBE",
    "PLANO DE SAÚDE / CONVÊNIO MÉDICO / ODONTO",
    "AÇÃO ESPECÍFICA",
] as const;

export const STATUS_OPTIONS = [
    "PRÉ-PRODUÇÃO",
    "PRODUÇÃO",
    "PENDENCIA - COMERCIAL",
    "PROTOCOLO",
] as const;

export const ORIGEM_OPTIONS = [
    "LEONARDO",
    "CARTEIRA",
    "LEAD",
    "CAMPANHA",
    "INDICAÇÃO",
    "RANGEL",
    "RODRIGO",
    "LUCIANA",
    "GEOVANNA",
    "DANNES",
    "OUTRO",
] as const;

export const BANKS = [
    {
        name: "Banco Bradesco S.A.",
        cnpj: "60.746.948/0001-12",
        address: "Cidade de Deus, s/nº, Vila Yara, Osasco/SP, CEP 06029-900"
    },
    {
        name: "Banco do Brasil S.A.",
        cnpj: "00.000.000/0001-91",
        address: "SAUN Quadra 5, Bloco B, Asa Norte, Brasília/DF, CEP 70040-911"
    },
    {
        name: "Banco Santander (Brasil) S.A.",
        cnpj: "90.400.888/0001-42",
        address: "Avenida Presidente Juscelino Kubitschek, 2041/2235, Vila Olímpia, São Paulo/SP, CEP 04543-011"
    },
    {
        name: "Caixa Econômica Federal",
        cnpj: "00.360.305/0001-04",
        address: "SBS Quadra 4, Lotes 3/4, Asa Sul, Brasília/DF, CEP 70092-900"
    },
    {
        name: "Itaú Unibanco S.A.",
        cnpj: "60.701.190/0001-04",
        address: "Praça Alfredo Egydio de Souza Aranha, 100, Torre Olavo Setubal, Jabaquara, São Paulo/SP, CEP 04344-902"
    },
    {
        name: "Banco Pan S.A.",
        cnpj: "59.285.411/0001-13",
        address: "Avenida Paulista, 1374, 16º andar, Bela Vista, São Paulo/SP, CEP 01310-916"
    },
    {
        name: "Banco BV (Votorantim S.A.)",
        cnpj: "01.858.774/0001-10",
        address: "Avenida das Nações Unidas, 14171, Torre A, Vila Gertrudes, São Paulo/SP, CEP 04794-000"
    },
    {
        name: "Banco BMG S.A.",
        cnpj: "61.186.680/0001-74",
        address: "Avenida Álvares Cabral, 1707, Lourdes, Belo Horizonte/MG, CEP 30170-001"
    },
    {
        name: "Banco C6 S.A.",
        cnpj: "31.872.495/0001-72",
        address: "Avenida 9 de Julho, 3186, Jardim Paulista, São Paulo/SP, CEP 01406-000"
    },
    {
        name: "Banco Inter S.A.",
        cnpj: "00.416.968/0001-01",
        address: "Avenida Barbacena, 1219, Santo Agostinho, Belo Horizonte/MG, CEP 30190-131"
    },
    {
        name: "Nu Pagamentos S.A. (Nubank)",
        cnpj: "18.236.120/0001-58",
        address: "Rua Capote Valente, 39, Pinheiros, São Paulo/SP, CEP 05409-000"
    },
    {
        name: "Banco Facta Financeira S.A.",
        cnpj: "15.581.638/0001-30",
        address: "Rua dos Andradas, 1409, 7º andar, Centro Histórico, Porto Alegre/RS, CEP 90020-009"
    },
    {
        name: "Banco Mercantil do Brasil S.A.",
        cnpj: "17.184.037/0001-10",
        address: "Rua Rio de Janeiro, 658, Centro, Belo Horizonte/MG, CEP 30160-041"
    },
    {
        name: "Banco Safra S.A.",
        cnpj: "58.160.789/0001-28",
        address: "Avenida Paulista, 2100, Bela Vista, São Paulo/SP, CEP 01310-930"
    },
    {
        name: "Banco Agibank S.A.",
        cnpj: "10.664.513/0001-05",
        address: "Rua Mariante, 25, 4º andar, Rio Branco, Porto Alegre/RS, CEP 90430-181"
    },
    {
        name: "PicPay Instituição de Pagamento S.A.",
        cnpj: "22.896.431/0001-10",
        address: "Avenida Manuel Bandeira, 291, Bloco A, Vila Leopoldina, São Paulo/SP, CEP 05317-020"
    },
    {
        name: "Banco Daycoval S.A.",
        cnpj: "62.232.889/0001-90",
        address: "Avenida Paulista, 1793, Bela Vista, São Paulo/SP, CEP 01311-200"
    },
    {
        name: "Banco Parati S.A.",
        cnpj: "03.311.493/0001-91",
        address: "Rua Senador Feijó, 205, Centro, São Paulo/SP, CEP 01006-001"
    },
] as const;
