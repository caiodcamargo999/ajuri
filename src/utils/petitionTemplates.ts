import {
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
} from "docx";
import { PetitionData, OfficeData, PetitionType } from "@/types/petition";
import { formatCurrency, formatDateShort, formatDate, formatCurrencyExtensoOnly } from "@/utils/formatters";

const FONT_FAMILY = "Arial";
const FONT_SIZE_NORMAL = 24;

function createTextRun(text: string, options?: { bold?: boolean; size?: number; italics?: boolean; color?: string; underline?: boolean }) {
    return new TextRun({
        text,
        font: FONT_FAMILY,
        size: options?.size || FONT_SIZE_NORMAL,
        bold: options?.bold,
        italics: options?.italics,
        color: options?.color,
        underline: options?.underline ? {} : undefined,
    });
}

function createParagraph(
    children: TextRun[],
    options?: {
        alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
        spacing?: { after?: number; before?: number; line?: number };
        indent?: { firstLine?: number };
    }
) {
    return new Paragraph({
        children,
        alignment: options?.alignment || AlignmentType.JUSTIFIED,
        spacing: {
            after: options?.spacing?.after ?? 200,
            before: options?.spacing?.before ?? 0,
            line: options?.spacing?.line ?? 360,
        },
        indent: options?.indent,
    });
}

// Helpers for common sections
const addStandardHeader = (children: (Paragraph | Table)[], comarca: string) => {
    children.push(
        createParagraph(
            [createTextRun(`AO JUÍZO DE DIREITO DA DA VARA CÍVEL DA COMARCA DE ${comarca}`, { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { after: 600 } }
        )
    );
};

const addAuthorQualification = (children: (Paragraph | Table)[], data: PetitionData, office: OfficeData) => {
    const { client } = data;
    const clientAddress = `${client.street || "[RUA/LOGRADOURO]"}, ${client.number || "[NÚMERO]"}, Bairro ${client.neighborhood || "[BAIRRO]"}, CEP ${client.cep || "[CEP]"}`;

    children.push(
        createParagraph([
            createTextRun(client.name || "[NOME DO CLIENTE]", { bold: true }),
            createTextRun(`, ${client.nationality || "[NACIONALIDADE]"}, ${client.civilStatus || "[ESTADO CIVIL]"}, ${client.profession || "[PROFISSÃO]"}, inscrito(a) no CPF sob o nº `),
            createTextRun(client.cpf || "000.000.000-00", { bold: true }),
            createTextRun(`, portador(a) do RG nº ${client.rg || "0000000"}, residente e domiciliado(a) na ${clientAddress}, ${client.city || "[CIDADE]"} / ${client.state || "[UF]"}, por intermédio de seu advogado, devidamente constituído, com escritório na ${office.address || "[DESCREVA O ENDEREÇO DO ESCRITÓRIO NAS CONFIGURAÇÕES]"} - CEP ${office.cep || "[CEP]"}, onde recebe intimações, vem, respeitosamente, perante Vossa Excelência, propor a presente:`),
        ])
    );
};

// --- TEMPLATES ---

const getBankingFeesTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client, bank, charges, moralDamage, wastedTimeDamage, chargeDescription } = data;
    const totalCharges = charges.reduce((sum, c) => sum + c.value, 0);
    const materialDamage = totalCharges * 2;
    const totalValue = materialDamage + moralDamage + wastedTimeDamage;
    const rubrica = chargeDescription || "TARIFAS BANCÁRIAS";
    const comarca = client.comarca || client.city?.toUpperCase() || "MANAUS";

    const children: (Paragraph | Table)[] = [];
    addStandardHeader(children, comarca);
    addAuthorQualification(children, data, office);

    children.push(
        createParagraph(
            [createTextRun("AÇÃO DE REPETIÇÃO DE INDÉBITO C/C INDENIZAÇÃO POR DANOS MORAIS", { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }
        )
    );

    children.push(
        createParagraph([
            createTextRun("em face de "),
            createTextRun(bank.name || "INSTITUIÇÃO FINANCEIRA", { bold: true }),
            createTextRun(`, CNPJ ${bank.cnpj}, com sede em ${bank.address}, pelos fatos e fundamentos a seguir expostos:`),
        ])
    );

    children.push(createParagraph([createTextRun("I - DOS FATOS", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400 } }));
    children.push(createParagraph([createTextRun(`O Autor é correntista da Ré e identificou descontos indevidos sob a rubrica "${rubrica}" em seus extratos, totalizando ${formatCurrency(totalCharges)}. Tais cobranças jamais foram autorizadas ou contratadas.`)], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("II - DO DIREITO", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400 } }));
    children.push(createParagraph([createTextRun(`Aplica-se o CDC (Súmula 297 STJ). A cobrança sem autorização é prática abusiva (Art. 39, III). O consumidor tem direito à repetição do indébito em dobro (Art. 42, parágrafo único).`)], { indent: { firstLine: 720 } }));
    children.push(createParagraph([createTextRun(`O valor do dano moral deve refletir o caráter punitivo e pedagógico, fixado em ${formatCurrency(moralDamage)}.`)], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("III - DOS PEDIDOS", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400 } }));
    children.push(createParagraph([createTextRun("1. A citação da Ré; 2. Inversão do ônus da prova; 3. Condenação à restituição de " + formatCurrency(materialDamage) + " (dobro); 4. Danos morais de " + formatCurrency(moralDamage) + ".")], { indent: { firstLine: 720 } }));

    return children;
};

const getRMCTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client, bank, moralDamage } = data;
    const comarca = client.comarca || client.city?.toUpperCase() || "MANAUS";
    const children: (Paragraph | Table)[] = [];

    addStandardHeader(children, comarca);
    addAuthorQualification(children, data, office);

    children.push(
        createParagraph(
            [createTextRun("AÇÃO DE DECLARAÇÃO DE NULIDADE DE CONTRATO DE CARTÃO DE CRÉDITO COM RMC C/C INDENIZAÇÃO", { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }
        )
    );

    children.push(createParagraph([createTextRun("em face de " + bank.name, { bold: true })]));

    children.push(createParagraph([createTextRun("I - DOS FATOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("A parte autora, ao buscar empréstimo consignado, foi induzida a erro, contratando serviço de cartão de crédito com Reserva de Margem Consignável (RMC). Nunca recebeu ou utilizou o cartão, mas sofre descontos perpétuos que pagam apenas juros rotativos.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("II - DO DIREITO", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Há clara falha no dever de informação (Art. 6, III CDC). A jurisprudência reconhece a 'dívida infinita' como abusiva. O contrato deve ser nulo e os valores devolvidos em dobro.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("III - DOS PEDIDOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Pede-se a nulidade do contrato, suspensão dos descontos (Liminar) e danos morais de " + formatCurrency(moralDamage) + ".")], { indent: { firstLine: 720 } }));

    return children;
};

const getFlightDelayTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client, moralDamage } = data;
    const comarca = client.comarca || client.city?.toUpperCase() || "MANAUS";
    const children: (Paragraph | Table)[] = [];

    addStandardHeader(children, comarca);
    addAuthorQualification(children, data, office);

    children.push(
        createParagraph(
            [createTextRun("AÇÃO INDENIZATÓRIA POR DANOS MORAIS E MATERIAIS (ATRASO/CANCELAMENTO DE VOO)", { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }
        )
    );

    children.push(createParagraph([createTextRun("I - DOS FATOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("O Autor adquiriu passagens aéreas e, na data prevista, o voo foi [atrasado/cancelado]. Houve perda de compromissos [citar compromissos] e ausência de assistência material adequada (alimentação/hospedagem).")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("II - DO DIREITO", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("A responsabilidade do transportador aéreo é objetiva (Art. 14 CDC e Convenção de Varsóvia/Montreal). O atraso superior a 4 horas gera presunção de dano moral (Súmula STJ).")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("III - DOS PEDIDOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Condenação ao pagamento de danos morais (" + formatCurrency(moralDamage) + ") e danos materiais correspondentes aos gastos extras.")], { indent: { firstLine: 720 } }));

    return children;
};

const getHealthNegationTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client, moralDamage } = data;
    const comarca = client.comarca || client.city?.toUpperCase() || "MANAUS";
    const children: (Paragraph | Table)[] = [];

    addStandardHeader(children, comarca);
    addAuthorQualification(children, data, office);

    children.push(
        createParagraph(
            [createTextRun("AÇÃO DE OBRIGAÇÃO DE FAZER C/C DANOS MORAIS COM PEDIDO DE TUTELA DE URGÊNCIA", { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }
        )
    );

    children.push(createParagraph([createTextRun("I - DOS FATOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("O Autor necessita de [procedimento/cirurgia/home care] conforme prescrição médica anexa. O Plano de Saúde negou a cobertura sob alegação de [falta de rol da ANS / carência], colocando em risco a vida/saúde do paciente.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("II - DO DIREITO", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("A negativa é abusiva. O rol da ANS é exemplificativo. Se há cobertura para a doença, o plano deve cobrir o tratamento prescrito pelo médico (Súmula 102 TJSP / Entendimento STJ).")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("III - DOS PEDIDOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Concessão de Liminar para realização imediata do procedimento. Ao final, confirmação da obrigação e danos morais de " + formatCurrency(moralDamage) + ".")], { indent: { firstLine: 720 } }));

    return children;
};

const getDivorceTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client } = data;
    const children: (Paragraph | Table)[] = [];

    children.push(createParagraph([createTextRun("AO JUÍZO DA VARA DE FAMÍLIA E SUCESSÕES DA COMARCA DE ...", { bold: true })], { alignment: AlignmentType.CENTER }));

    children.push(createParagraph([createTextRun("DIVÓRCIO CONSENSUAL", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }));

    children.push(createParagraph([createTextRun("Os Requerentes, de comum acordo, vêm expor que contraíram matrimônio em [data], sob o regime de [regime]. Não desejam mais manter a união. Há [filhos/bens] a considerar conforme termos abaixo:")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("1. Dos Bens: [Descrever partilha]; 2. Dos Filhos: [Guarda e visitas]; 3. Alimentos: [Valor da pensão].")]));

    children.push(createParagraph([createTextRun("Requerem a homologação do divórcio e expedição de mandado de averbação.")], { spacing: { before: 400 } }));

    return children;
};

const getUsucapiaoTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client } = data;
    const children: (Paragraph | Table)[] = [];

    children.push(createParagraph([createTextRun("AO OFICIAL DE REGISTRO DE IMÓVEIS DA COMARCA DE ...", { bold: true })], { alignment: AlignmentType.CENTER }));

    children.push(createParagraph([createTextRun("REQUERIMENTO DE USUCAPIÃO EXTRAJUDICIAL (PROVIMENTO 65 CNJ)", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }));

    children.push(createParagraph([createTextRun("O Requerente detém a posse mansa, pacífica e ininterrupta do imóvel situado na [endereço], há mais de [anos] anos, com animus domini. Apresenta ata notarial e planta descritiva anexa.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("Requer o processamento e posterior registro da propriedade em seu nome.")], { spacing: { before: 400 } }));

    return children;
};

const getPixFraudTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const { client, bank, moralDamage } = data;
    const comarca = client.comarca || client.city?.toUpperCase() || "MANAUS";
    const children: (Paragraph | Table)[] = [];

    addStandardHeader(children, comarca);
    addAuthorQualification(children, data, office);

    children.push(
        createParagraph(
            [createTextRun("AÇÃO DE RESSARCIMENTO C/C DANOS MORAIS (FRAUDE/GOLPE DO PIX)", { bold: true })],
            { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }
        )
    );

    children.push(createParagraph([createTextRun("I - DOS FATOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("O Autor foi vítima de golpe via Pix no valor de [valor]. Acionou o banco imediatamente via MED (Mecanismo Especial de Devolução), porém o banco falhou em bloquear os valores ou rastrear a conta destino fraudulenta.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("II - DO DIREITO", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Responsabilidade Objetiva dos bancos em falhas de segurança (Súmula 479 STJ). O banco responde pelo fortuito interno e ineficiência do sistema antifraude.")], { indent: { firstLine: 720 } }));

    children.push(createParagraph([createTextRun("III - DOS PEDIDOS", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Restituição do valor do Pix e danos morais de " + formatCurrency(moralDamage) + ".")], { indent: { firstLine: 720 } }));

    return children;
};

const getMandamusTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const children: (Paragraph | Table)[] = [];
    children.push(createParagraph([createTextRun("MANDADO DE SEGURANÇA COM PEDIDO LIMINAR", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("Ato coator praticado pelo [Autoridade] relacionado ao concurso público [Nome]. O Impetrante foi preterido em decorrência de [anulação questão / erro nomeação]. Há prova pré-constituída do direito líquido e certo.")], { indent: { firstLine: 720 } }));
    children.push(createParagraph([createTextRun("Pede-se liminar para reserva de vaga e posterior concessão da segurança.")]));
    return children;
};

const getTrafficFineTemplate = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    const children: (Paragraph | Table)[] = [];
    children.push(createParagraph([createTextRun("DEFESA ADMINISTRATIVA / AÇÃO DE ANULAÇÃO DE MULTA DE TRÂNSITO", { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(createParagraph([createTextRun("O Autor foi autuado indevidamente por infração que não cometeu ou cujo auto de infração padece de vício insanável [descrever vício, ex: falta de sinalização, erro no radar].")], { indent: { firstLine: 720 } }));
    children.push(createParagraph([createTextRun("Requer o cancelamento da autuação e dos pontos na CNH.")]));
    return children;
};

// --- MAIN EXPORT ---

export const getPetitionContent = (data: PetitionData, office: OfficeData): (Paragraph | Table)[] => {
    switch (data.petitionType) {
        case 'TARIFAS_INDEVIDAS': return getBankingFeesTemplate(data, office);
        case 'RMC': return getRMCTemplate(data, office);
        case 'ATRASO_VOO': return getFlightDelayTemplate(data, office);
        case 'SAUDE_CIRURGIA': return getHealthNegationTemplate(data, office);
        case 'DIVORCIO_CONSENSUAL': return getDivorceTemplate(data, office);
        case 'USUCAPIAO_EXTRAJUDICIAL': return getUsucapiaoTemplate(data, office);
        case 'GOLPE_PIX': return getPixFraudTemplate(data, office);
        case 'MS_CONCURSO': return getMandamusTemplate(data, office);
        case 'MULTA_TRANSITO': return getTrafficFineTemplate(data, office);
        default: return getBankingFeesTemplate(data, office);
    }
};
