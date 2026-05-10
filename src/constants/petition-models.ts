import { Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from "docx";
import { formatCurrency, valorPorExtenso } from "@/utils/currency";
import { OfficeData } from "@/types/petition";

// Helper for dynamic signature
const getSignature = (office: OfficeData, dataHoje: string) => [
    new Paragraph({
        text: `${office.city || "Manaus"} / ${office.state || "Amazonas"}, ${dataHoje}.`,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 800, after: 400 },
    }),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
            new TextRun({
                text: "_______________________________________________________",
                bold: true,
            }),
        ],
    }),
    new Paragraph({
        children: [
            new TextRun({ text: office.name.toUpperCase(), bold: true, size: 24 }),
        ],
        alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
        text: office.oabNumbers || "OAB/AM 15.128 | OAB/CE 53112-A | OAB/RR 806-A",
        alignment: AlignmentType.RIGHT,
    }),
];

export const getTarifasBancariasChildren = (data: any, office: OfficeData) => {
    const descontosDobro = (data.valorDescontos || 0) * 2;
    const tempoDesperdiciadoValue = 2000;
    const danosMorais = data.danoMoral || 0;
    const danosTotais = descontosDobro + danosMorais + tempoDesperdiciadoValue;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return [
        new Paragraph({
            children: [
                new TextRun({ text: (data.nomeCliente || "CLIENTE").toUpperCase(), bold: true }),
                new TextRun(`, ${data.nacionalidade || "brasileiro(a)"}, ${data.estadoCivil || "casado(a)"}, `),
                new TextRun(`${data.profissao || "trabalhador(a)"}, CPF Nº. ${data.cpfCliente || "000.000.000-00"}, RG Nº. ${data.rgCliente || "0000000-0"} - SSP, residente e domiciliado no ${data.enderecoCliente || "Endereço Completo"}, Bairro: ${data.bairroCliente || "Bairro"}, CEP: `),
                new TextRun(`${data.cepCliente || "00000-000"}, ${data.comarca || office.city || "Sua Cidade"}, por intermédio de seu `),
                new TextRun(`advogado, legalmente constituído, com escritório profissional na ${office.address || "endereço do escritório"}, `),
                new TextRun(`onde recebe intimações e notificações, com base nos artigos 319 e `),
                new TextRun(`seguintes do Código de Processo Civil, bem como no art. 5º, V, CRFB/88 e `),
                new TextRun(`demais dispositivos legais previstos no Código de Defesa do Consumidor e `),
                new TextRun(`na Autorregulação Bancária propor:`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [
                new TextRun({ text: "AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS POR COBRANÇA INDEVIDA", bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 800 },
        }),

        new Paragraph({
            children: [
                new TextRun("em face de "),
                new TextRun({ text: (data.requeridoNome || "BANCO RÉU").toUpperCase(), bold: true }),
                new TextRun(`, pessoa jurídica de direito privado, com `),
                new TextRun(`registro no CNPJ sob o nº ${data.cnpjRequerido || "00.000.000/0000-00"}, com sede na cidade de `),
                new TextRun(`${data.enderecoRequerido || "Endereço do Banco"}, pelas razões de fato e de direito que passa a expor:`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 800 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "I - DOS FATOS", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
            text: `A parte Autora mantém vínculo contratual com a instituição financeira conforme comprovado, todavia, ao proceder à conferência de seus extratos bancários, constatou a realização de descontos indevidos em sua conta corrente a título de "${data.nomeDesconto || "TARIFAS"}", sem que houvesse qualquer solicitação, anuência ou assinatura de contrato específico que legitimasse tais cobranças. Evidencia-se, assim, a ocorrência de descontos unilaterais e abusivos, perpetrados em flagrante desrespeito aos princípios da lealdade contratual, da informação e da transparência, expressamente consagrados no Código de Defesa do Consumidor.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Não restando alternativa à parte Autora, senão socorrer-se do Poder Judiciário para ver declarada a inexistência da relação jurídica que fundamentaria tais cobranças, bem como para restituir os valores pagos em razão da conduta abusiva da instituição financeira.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "II - DO DIREITO", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "1. – DA APLICABILIDADE DO CÓDIGO DE DEFESA DO CONSUMIDOR E RELAÇÃO DE CONSUMO", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "A presente demanda versa sobre relação de consumo, plenamente caracterizada pela existência de vínculo jurídico entre a instituição financeira, fornecedora de serviços bancários, e a parte autora, destinatária final desses serviços, nos termos dos artigos 2º e 3º do Código de Defesa do Consumidor (Lei nº 8.078/90).",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: 'O entendimento é consolidado pela Súmula 297 do STJ, que dispõe: "O Código de Defesa do Consumidor é aplicável às instituições financeiras."',
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: `O Banco Réu, ao realizar cobranças a título de "${data.nomeDesconto || "TARIFAS"}" sem respaldo contratual, violou frontalmente tais princípios, configurando prática abusiva e enriquecimento sem causa. Dessa forma, é inequívoca a incidência das normas consumeristas ao caso em tela, devendo-se assegurar à parte autora a proteção conferida pelo diploma legal, especialmente quanto aos princípios da boa-fé objetiva, da transparência, da informação e da proibição de práticas abusivas.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "A aplicação do CDC é, portanto, imperiosa e imprescindível à solução da presente controvérsia, especialmente diante da prática abusiva de prestação de serviço sem consentimento, da falta de clareza nos lançamentos e da ausência de contrato firmado entre as partes.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "2. – DA COBRANÇA INDEVIDA E DA REPETIÇÃO DO INDÉBITO", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "A cobrança realizada pela instituição financeira, sem qualquer respaldo contratual ou autorização expressa do consumidor, configura cobrança indevida nos termos do art. 42, parágrafo único, do Código de Defesa do Consumidor, que determina a restituição em dobro dos valores pagos indevidamente.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "No presente caso, não há qualquer indício de engano justificável. Ao contrário: os descontos foram realizados de forma sistemática, sem contrato, sem ciência ou autorização da autora. A conduta da instituição financeira foi deliberada e reiterada, o que agrava sua responsabilidade civil.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Ressalte-se que a repetição do indébito, em dobro, não depende de prova do dolo ou má-fé, sendo suficiente a comprovação do pagamento indevido e da ausência de autorização, requisitos amplamente preenchidos neste feito.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "3. – DA RESPONSABILIDADE OBJETIVA DA INSTITUIÇÃO FINANCEIRA", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: 'No âmbito das relações bancárias, resta consolidado o entendimento de que os bancos se enquadram no conceito de fornecedores de serviços, enquanto o correntista figura como consumidor final, nos termos dos artigos 2º e 3º do CDC e da Súmula 297 do Superior Tribunal de Justiça, que estabelece que "O Código de Defesa do Consumidor é aplicável às instituições financeiras."',
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Assim, a responsabilidade da instituição financeira decorre da falha na prestação do serviço, prescindindo de qualquer demonstração de culpa. Basta que se comprove a conduta lesiva, o dano experimentado e o nexo causal entre a conduta do agente e o dano sofrido pelo consumidor.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Em suma, a responsabilidade objetiva das instituições financeiras traduz-se na aplicação concreta da teoria do risco do empreendimento, segundo a qual aquele que aufere lucro com a atividade econômica deve suportar os riscos inerentes à sua operação, garantindo ao consumidor a reparação integral dos prejuízos sofridos, bastando a comprovação da conduta lesiva, do dano e do nexo causal.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "4. – DA INVERSÃO DO ÔNUS DA PROVA", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "A aplicação do CDC é imperiosa à solução da presente controvérsia, especialmente diante da prática abusiva de prestação de serviço sem consentimento, da falta de clareza nos lançamentos e da ausência de contrato firmado entre as partes.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Nos termos do art. 6º, VIII, do CDC, a inversão do ônus da prova é medida que se impõe, sendo evidente a hipossuficiência técnica e econômica da parte autora em relação à instituição financeira requerida, bem como a verossimilhança das alegações apresentadas.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "5. - DOS DANOS MATERIAIS – REPETIÇÃO DO INDÉBITO", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            children: [
                new TextRun("Assim, requer-se a condenação da parte ré à DEVOLUÇÃO EM DOBRO o valor de "),
                new TextRun({ text: `${formatCurrency(descontosDobro)} (${valorPorExtenso(descontosDobro)})`, bold: true }),
                new TextRun(", de todos os valores indevidamente descontados, DESDE O PRIMEIRO EVENTO DANOSO até a CESSAÇÃO DA COBRANÇA, devidamente CORRIGIDOS E ACRESCIDOS DE JUROS LEGAIS, os quais devem incidir a partir do evento danoso, conforme orientação da Súmula 54 do STJ."),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "6. - DOS DANOS MORAIS", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "A conduta da instituição ré ultrapassa os limites do mero aborrecimento ou dissabor cotidiano. A cobrança indevida de valores da conta bancária da autora, de forma reiterada e sem qualquer respaldo contratual, caracteriza evidente violação à dignidade do consumidor e atinge a esfera extrapatrimonial da parte autora. O dano moral, neste contexto, é presumido (in re ipsa).",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            children: [
                new TextRun("Dessa forma, requer-se a condenação do Reclamado ao pagamento de INDENIZAÇÃO POR DANOS MORAIS, em razão das práticas abusivas e ilegais perpetradas, no valor não inferior a "),
                new TextRun({ text: `${formatCurrency(danosMorais)} (${valorPorExtenso(danosMorais)})`, bold: true }),
                new TextRun(", quantia esta que se revela compatível com os princípios da razoabilidade, proporcionalidade e função pedagógica da reparação civil. Tal pleito não busca qualquer enriquecimento sem causa, mas apenas o reconhecimento e a justa compensação pelo desrespeito e pela frustração da confiança depositada pelo consumidor."),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "VII – DO TEMPO DESPERDIÇADO", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "Além dos prejuízos materiais e morais já demonstrados, cumpre destacar a incidência da Teoria do Desvio Produtivo do Consumidor, também denominada Teoria do Tempo Desperdiçado, desenvolvida por Marcos Dessaune e amplamente acolhida pela doutrina e jurisprudência pátrias, inclusive pelo Superior Tribunal de Justiça.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Tal teoria reconhece que o tempo útil que o consumidor é compelido a despender para resolver problemas decorrentes de falhas na prestação de serviços, como cobranças indevidas, omissões e desorganização por parte do fornecedor, constitui dano moral indenizável, por violar direitos da personalidade, frustrar a legítima expectativa de boa-fé e impor desgaste emocional, estresse e perda de tempo existencial.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            children: [
                new TextRun("Requer-se, portanto, a condenação do requerido ao pagamento de "),
                new TextRun({ text: `${formatCurrency(tempoDesperdiciadoValue)} (${valorPorExtenso(tempoDesperdiciadoValue)})`, bold: true }),
                new TextRun(" a título de indenização pelo tempo desperdiçado (Desvio Produtivo do Consumidor)."),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "VIII – DOS PEDIDOS", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({ text: "Ante o exposto, requer:", spacing: { after: 200 } }),

        new Paragraph({ text: "1. Seja reconhecida a relação de consumo entre as partes, aplicando-se integralmente o Código de Defesa do Consumidor (arts. 2º, 3º e 14 do CDC), com a consequente inversão do ônus da prova (art. 6º, VIII, do CDC), diante da hipossuficiência técnica e econômica da parte autora;", bullet: { level: 0 } }),
        new Paragraph({ text: "2. Que o requerido apresente os contratos específicos, a comprovação dos aditivos com a anuência do consumidor durante o decorrer do período de desconto que justifique os valores cobrados;", bullet: { level: 0 } }),
        new Paragraph({ text: `3. Seja reconhecida a ilegalidade e abusividade dos descontos realizados sob a rubrica "${data.nomeDesconto || "TARIFAS"}";`, bullet: { level: 0 } }),
        new Paragraph({
            children: [
                new TextRun(`4. Seja a parte ré condenada à restituição em dobro dos valores indevidamente descontados, com repetição do indébito (2x), totalizando o valor de `),
                new TextRun({ text: `${formatCurrency(descontosDobro)} (${valorPorExtenso(descontosDobro)})`, bold: true }),
                new TextRun(`, devidamente corrigidos monetariamente e acrescidos de juros moratórios de 1% ao mês desde o evento danoso;`),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({
            children: [
                new TextRun("5. Seja a parte ré condenada ao pagamento de indenização por danos morais no valor não inferior a "),
                new TextRun({ text: `${formatCurrency(danosMorais)} (${valorPorExtenso(danosMorais)})`, bold: true }),
                new TextRun(";"),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({
            children: [
                new TextRun("6. Seja a parte ré condenada ao pagamento de "),
                new TextRun({ text: `${formatCurrency(tempoDesperdiciadoValue)} (${valorPorExtenso(tempoDesperdiciadoValue)})`, bold: true }),
                new TextRun(" a título de indenização pelo tempo desperdiçado;"),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({
            children: [
                new TextRun("7. Dá-se à causa o valor de "),
                new TextRun({ text: `${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)})`, bold: true }),
                new TextRun(", correspondente à soma dos danos materiais, danos morais e tempo desperdiçado."),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({ text: "8. A condenação do requerido ao pagamento de custas processuais e honorários advocatícios;", bullet: { level: 0 } }),
        new Paragraph({ text: "9. A produção de todos os meios de prova em direito admitidos, especialmente documental.", bullet: { level: 0 } }),

        new Paragraph({ text: "Nestes termos,", spacing: { before: 400 } }),
        new Paragraph({ text: "Pede deferimento.", spacing: { after: 800 } }),

        ...getSignature(office, dataHoje),
    ];
};

export const getDivorcioChildren = (data: any, office: OfficeData) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return [
        new Paragraph({
            text: "AO JUÍZO DE DIREITO DA   VARA DE FAMÍLIA DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "AÇÃO DE DIVÓRCIO CONSENSUAL",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: `Os requerentes, de comum acordo e plena consciência, vêm à presença deste juízo expor a impossibilidade de convivência matrimonial, requerendo a dissolução definitiva do vínculo através do divórcio direto, nos termos do Art. 226, § 6º da CF/88.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Declaram a inexistência de bens comuns a partilhar e que os filhos menores já possuem plano de guarda e alimentos estabelecido (or não possuem prole menor), requerendo apenas a chancela judicial para sua eficácia plena.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getUsucapiaoChildren = (data: any, office: OfficeData) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return [
        new Paragraph({
            text: "AO OFICIAL DE REGISTRO DE IMÓVEIS DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "REQUERIMENTO DE RECONHECIMENTO EXTRAJUDICIAL DE USUCAPIÃO",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: `O Requerente detém a posse ad usucapionem (mansa, pacífica e ininterrupta) do imóvel situado na ${data.enderecoCliente}, exercendo nela sua moradia habitual com 'animus domini' há longo período, preenchendo todos os requisitos legais.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "O pedido fundamenta-se no Art. 216-A da Lei de Registros Públicos, visando a regularização fundiária e a função social da propriedade.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getConcursoChildren = (data: any, office: OfficeData) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return [
        new Paragraph({
            text: "AO JUÍZO DE DIREITO DA   VARA DA FAZENDA PÚBLICA DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "MANDADO DE SEGURANÇA COM PEDIDO DE LIMINAR",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: `O Impetrante insurge-se contra ato coator desprovido de legalidade e motivação, ocorrido em certame público. A Administração Pública violou direito líquido e certo ao [DESCREVER ATO], impondo barreira ilegal à progressão do candidato.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getTransitoChildren = (data: any, office: OfficeData) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return [
        new Paragraph({
            text: "AO PRESIDENTE DA JARI DO ÓRGÃO DE TRÂNSITO RESPONSÁVEL",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "RECURSO ADMINISTRATIVO CONTRA AUTO DE INFRAÇÃO DE TRÂNSITO",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: `O Recorrente insurge-se contra a penalidade de multa aplicada no AIT nº [NÚMERO], pautada em erro de fato e ausência de aferição técnica obrigatória. Requer-se a anulação do auto por vício de forma e substância.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getSeguroContratoVeiculosChildren = (data: any, office: OfficeData) => {
    const seguroDobro = (data.valorDescontos || 0) * 2;
    const danosMorais = data.danoMoral || 0;
    const danosTotais = seguroDobro + danosMorais;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return [
        new Paragraph({
            text: `AO JUIZO DA ___ VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ${data.comarca ? data.comarca.toUpperCase() : "MANAUS – AMAZONAS"}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            bold: true,
        }),

        new Paragraph({
            children: [
                new TextRun({ text: (data.nomeCliente || "CLIENTE").toUpperCase(), bold: true }),
                new TextRun(`, ${data.nacionalidade || "brasileira"}, ${data.estadoCivil || "casada"}, ${data.profissao || "trabalhadora"}, portadora do CPF n° ${data.cpfCliente || "000.000.000-00"}, endereço eletrônico: ${data.emailCliente || "email@email.com"}, residente e domiciliada na ${data.enderecoCliente || "Endereço Completo"}, n° ${data.numeroEndereco || "S/N"}, Bairro ${data.bairroCliente || "Bairro"}, CEP: ${data.cepCliente || "00000-000"}, ${data.comarca || office.city || "Sua Cidade"}, por seus procuradores signatários, ut instrumento procuratório incluso, vem respeitosamente à presença de V.Exa. propor:`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [
                new TextRun({ text: "AÇÃO DE INEXIGIBILIDADE DE SEGURO C/C POR DANOS MATERIAIS E MORAIS", bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 800 },
        }),

        new Paragraph({
            children: [
                new TextRun("Em face de "),
                new TextRun({ text: (data.requeridoNome || "BANCO RÉU").toUpperCase(), bold: true }),
                new TextRun(`, pessoa jurídica de direito privado, inscrito no CNPJ ${data.cnpjRequerido || "00.000.000/0000-00"}, com sede no ${data.enderecoRequerido || "Endereço do Banco"}, o que faz pelos fatos e fundamentos a seguir expostos:`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 800 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "• DOS FATOS", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
            text: `A parte Requerente firmou com o Réu, em ${data.dataContrato || "___/___/_____"}, contrato de cédula de crédito bancário n.º ${data.numeroContrato || "_______________"}, para financiamento de veículo em ${data.numeroParcelas || "___"} (${valorPorExtenso(data.numeroParcelas || 0)}) vezes.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: `Ocorre que, no momento da contratação do financiamento, foi inserido no contrato, sem o livre e esclarecido consentimento do(a) consumidor(a), o produto denominado "${data.nomeDesconto || "SEGURO"}", no valor de R$ ${formatCurrency(data.valorDescontos)} (${valorPorExtenso(data.valorDescontos)}), sem que lhe fosse devidamente explicado o produto, seu custo e muito menos dada a opção de recusa.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: `Ora, qual consumidor que buscou o requerido para a realização de um financiamento de veículo em ${data.numeroParcelas || "___"} (${valorPorExtenso(data.numeroParcelas || 0)}) vezes, pois não tem condições de pagar em menos tempo, haja vista que as parcelas ficariam elevadas, iria contratar uma tarifa de R$ ${formatCurrency(data.valorDescontos)} (${valorPorExtenso(data.valorDescontos)}) e gerar outros gastos? É infundamentada a linha de raciocínio que acredita que iria.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Causa espanto o fato de a instituição financeira realizar este tipo de conduta conhecida como \"venda casada\", deixando o consumidor totalmente refém do seu procedimento unilateral, o que não merece prosperar impunemente.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "O dever de informar que não houve no caso em tela representa, no sistema do CDC, um verdadeiro dever essencial, para a harmonia e transparência das relações de consumo.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "A cobrança consiste numa onerosidade excessiva para o consumidor, ferindo consideravelmente as normas dispostas na legislação protetiva das relações de consumo, bem como, de forma bem especial, do consumidor.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "• DO DIREITO", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
            text: "A matéria ora discutida encontra amplo respaldo no ordenamento jurídico brasileiro, especialmente no Código de Defesa do Consumidor (Lei nº 8.078/1990) e na jurisprudência consolidada do Superior Tribunal de Justiça.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "O STJ, em sede de recurso repetitivo (REsp. 1.639.259), fixou as seguintes teses:",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "\"1. [...] o correspondente bancário, no âmbito das relações de consumo. 2. TESES FIXADAS PARA OS FINS DO ART. 1.040 DO CPC/2015: 2.1 - Abusividade da cláusula que prevê o ressarcimento pelo consumidor da despesa com o registro do pré-gravame, em contratos celebrados a partir de 25/02/2011, data de entrada em vigor da Res.-CMN 3.954/2011, sendo válida a cláusula pactuada no período anterior a essa resolução, ressalvado o controle da onerosidade excessiva. 2.2 - Nos contratos bancários em geral, o consumidor não pode ser compelido a contratar seguro com a instituição financeira ou com seguradora por ela indicada. 2.3 - A abusividade de encargos acessórios do contrato não descaracteriza a mora.\"",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 200, after: 200 },
            indent: { left: 720, right: 720 },
        }),

        new Paragraph({
            text: "Portanto, é expressa e consolidada a proibição de que o consumidor seja compelido a contratar seguro com a instituição financeira ou por ela indicada, sendo nula de pleno direito a cláusula contratual que assim dispõe.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "A conduta do(a) requerido(a) configura, ainda, prática de venda casada, expressamente vedada pelo art. 39, inciso I, do CDC, que proíbe o fornecedor de condicionar o fornecimento de produto ou serviço à aquisição de outro produto ou serviço.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Nos termos do art. 42, parágrafo único, do CDC, é devida a restituição em dobro dos valores cobrados indevidamente, acrescidos de correção monetária e juros legais, desde a data de cada cobrança.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "• DOS DANOS MATERIAIS – REPETIÇÃO DO INDÉBITO", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            children: [
                new TextRun(`Com fundamento no art. 42, parágrafo único, do Código de Defesa do Consumidor, requer-se a restituição em dobro do valor cobrado indevidamente a título de "${data.nomeDesconto || "SEGURO"}", no montante de R$ ${formatCurrency(data.valorDescontos)} (${valorPorExtenso(data.valorDescontos)}), totalizando, com a repetição do indébito, `),
                new TextRun({ text: `R$ ${formatCurrency(seguroDobro)} (${valorPorExtenso(seguroDobro)})`, bold: true }),
                new TextRun(", devidamente corrigido monetariamente e acrescido de juros moratórios desde a data da cobrança."),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "• DOS DANOS MORAIS", bold: true })],
            spacing: { before: 200, after: 100 },
        }),

        new Paragraph({
            text: "A conduta do(a) requerido(a), ao impor ao(à) consumidor(a) produto não solicitado e não autorizado, causa dano moral que supera o mero aborrecimento, atingindo a esfera extrapatrimonial do(a) requerente, que se viu vítima de prática abusiva em uma relação que deveria ser pautada pela boa-fé e pela transparência.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Para que além de ser punido pela atitude unilateral que o mesmo teve na presente lide, servirá para que pense mais de uma vez se valerá fazer a mesma ilicitude com outros consumidores.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Na fixação do montante devido, o prudente arbítrio do julgador deve considerar os fins pedagógico e punitivo da reparação moral, sem embargo de sopesar as circunstâncias próprias do agravo causado ao consumidor.",
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),

        new Paragraph({
            children: [
                new TextRun("Requer-se, portanto, a condenação do(a) requerido(a) ao pagamento de indenização por danos morais no valor não inferior a "),
                new TextRun({ text: `R$ ${formatCurrency(danosMorais)} (${valorPorExtenso(danosMorais)})`, bold: true }),
                new TextRun("."),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: "* DOS PEDIDOS — REQUER", bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),

        new Paragraph({ text: "1. A inversão do ônus da prova ao réu, nos termos do Código de Defesa do Consumidor;", bullet: { level: 0 } }),
        new Paragraph({ text: "2. A citação do Requerido para, se quiser, responder os atos e termos desta ação, que deverá ser julgada procedente;", bullet: { level: 0 } }),
        new Paragraph({ text: "3. A Gratuidade da Justiça, eis que não pode demandar em juízo sem prejuízo do sustento próprio e de sua família;", bullet: { level: 0 } }),
        new Paragraph({ text: `4. A declaração de nulidade e inexigibilidade do "${data.nomeDesconto || "SEGURO"}" no valor de R$ ${formatCurrency(data.valorDescontos)} (${valorPorExtenso(data.valorDescontos)});`, bullet: { level: 0 } }),
        new Paragraph({
            children: [
                new TextRun(`5. A devolução em dobro do valor cobrado indevidamente a título de "${data.nomeDesconto || "SEGURO"}", totalizando `),
                new TextRun({ text: `R$ ${formatCurrency(seguroDobro)} (${valorPorExtenso(seguroDobro)})`, bold: true }),
                new TextRun(`, devidamente corrigido monetariamente e acrescido de juros legais desde a data da cobrança;`),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({
            children: [
                new TextRun("6. A condenação do(a) requerido(a) ao pagamento de indenização por danos morais no valor não inferior a "),
                new TextRun({ text: `R$ ${formatCurrency(danosMorais)} (${valorPorExtenso(danosMorais)})`, bold: true }),
                new TextRun(";"),
            ],
            bullet: { level: 0 }
        }),
        new Paragraph({ text: "7. A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios;", bullet: { level: 0 } }),
        new Paragraph({ text: "8. A produção de todos os meios de prova em direito admitidos, especialmente documental.", bullet: { level: 0 } }),

        new Paragraph({
            children: [
                new TextRun({ text: "Dá-se à causa o valor de ", bold: true }),
                new TextRun({ text: `R$ ${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)})`, bold: true }),
                new TextRun("."),
            ],
            spacing: { before: 800, after: 400 },
        }),

        new Paragraph({ text: "Nestes termos,", spacing: { before: 400 } }),
        new Paragraph({ text: "Pede deferimento.", spacing: { after: 800 } }),

        ...getSignature(office, dataHoje),
    ];
};

export const getAtrasoVooChildren = (data: any, office: OfficeData) => {
    const danosTotais = data.valorDescontos + data.danoMoral + 2000;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return [
        new Paragraph({
            text: "AO JUÍZO DE DIREITO DA   VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS DECORRENTES DE FALHA NA PRESTAÇÃO DE SERVIÇO DE TRANSPORTE AÉREO",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: data.nomeCliente.toUpperCase(), bold: true }),
                new TextRun(`, qualificado nos autos, vem propor a presente ação em face de `),
                new TextRun({ text: data.requeridoNome.toUpperCase(), bold: true }),
                new TextRun(`, empresa de transporte aéreo com sede em ${data.enderecoRequerido}.`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "I - DOS FATOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `O autor adquiriu passagens aéreas junto à Ré, contudo, o voo programado sofreu um atraso/cancelamento injustificado superior a 4 horas. O consumidor foi mantido em total desamparo, sem que houvesse prestação de assistência material adequada (alimentação, comunicação e hospedagem), contrariando os deveres da Resolução 400 da ANAC.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `Tal situação causou ao Autor a perda de compromissos pessoais/profissionais inadiáveis e gastos extras com transporte e alimentação na ordem de ${formatCurrency(data.valorDescontos)}, gerando profundo desconforto e violação à dignidade do passageiro.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "II - DO DIREITO", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `A responsabilidade das companhias aéreas é objetiva, pautada no Art. 14 do CDC. No transporte aéreo, o transportador assume obrigação de resultado: levar o passageiro ao destino na hora aprazada. Qualquer atraso superior a 4 horas caracteriza descumprimento contratual grave e falha na prestação do serviço.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `O STF e o STJ já pacificaram que o Código de Defesa do Consumidor prevalece sobre as Convenções de Varsóvia e Montreal em matéria de danos morais. A falta de assistência material adequada gera dano moral 'in re ipsa', ou seja, decorre do próprio fato do atraso e do descaso com o ser humano.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "III - DOS PEDIDOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({ text: `1. A condenação da Ré a indenizar os danos materiais de ${formatCurrency(data.valorDescontos)};`, bullet: { level: 0 } }),
        new Paragraph({ text: `2. A condenação por danos morais pedagógicos de ${formatCurrency(data.danoMoral)};`, bullet: { level: 0 } }),
        new Paragraph({ text: `3. Indenização complementar pelo tempo desperdiçado de R$ 2.000,00.`, bullet: { level: 0 } }),
        new Paragraph({
            text: `Dá-se à causa o valor de ${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)}).`,
            spacing: { before: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getSaudeChildren = (data: any, office: OfficeData) => {
    const danosTotais = data.danoMoral + 10000;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return [
        new Paragraph({
            text: "AO JUÍZO DE DIREITO DA   VARA CÍVEL DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "AÇÃO DE OBRIGAÇÃO DE FAZER COM PEDIDO DE TUTELA DE URGÊNCIA ANTECIPADA C/C INDENIZAÇÃO POR DANOS MORAIS",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: data.nomeCliente.toUpperCase(), bold: true }),
                new TextRun(`, qualificado nos autos, vem propor em face de `),
                new TextRun({ text: data.requeridoNome.toUpperCase(), bold: true }),
                new TextRun(`, operadora de plano de saúde com sede em ${data.enderecoRequerido}.`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "I - DOS FATOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `A parte autora é beneficiária do plano de saúde administrado pela Ré. Diante de quadro clínico grave e urgente, foi prescrito pelo médico assistente o procedimento/insumo: "${data.nomeDesconto}", essencial para a manutenção da vida e saúde do paciente.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `Contudo, a Ré negou a cobertura sob justificativas genéricas e abusivas (cláusula limitativa ou ausência de rol da ANS), colocando em risco iminente a integridade física do Autor. Tal negativa é ilegal, visto que o rol da ANS é meramente exemplificativo e não pode sobrepor-se à prescrição médica.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "II - DA TUTELA DE URGÊNCIA", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `Estão presentes os requisitos do Art. 300 do CPC: a Probabilidade do Direito (laudo médico e contrato) e o Perigo de Dano (risco de morte ou agravamento irreversível). Requer-se a concessão imediata da tutela para obrigar a Ré ao fornecimento total do tratamento, sob pena de multa diária.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "III - DO DIREITO", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `A jurisprudência do STJ é pacífica: 'É abusiva a cláusula contratual que exclui tratamento prescrito pelo médico para garantir a saúde ou a vida do segurado'. A negativa de cobertura gera dano moral 'in re ipsa', face à aflição e angústia causadas ao paciente em momento de vulnerabilidade extrema.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "IV - DOS PEDIDOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({ text: "1. A concessão da tutela de urgência inaudita altera parte;", bullet: { level: 0 } }),
        new Paragraph({ text: `2. A confirmação da obrigação de fazer definitiva;`, bullet: { level: 0 } }),
        new Paragraph({ text: `3. Indenização por danos morais de ${formatCurrency(data.danoMoral)}.`, bullet: { level: 0 } }),
        new Paragraph({
            text: `Dá-se à causa o valor de ${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)}).`,
            spacing: { before: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};

export const getGolpePixChildren = (data: any, office: OfficeData) => {
    const danosTotais = data.valorDescontos + data.danoMoral + 2000;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return [
        new Paragraph({
            text: "AO JUÍZO DE DIREITO DA   VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ______________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS - FRAUDE BANCÁRIA (PIX / ENGENHARIA SOCIAL)",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 600 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: data.nomeCliente.toUpperCase(), bold: true }),
                new TextRun(`, qualificado nos autos, vem propor em face de `),
                new TextRun({ text: data.requeridoNome.toUpperCase(), bold: true }),
                new TextRun(`, com sede em ${data.enderecoRequerido}.`),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "I - DOS FATOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `A parte Autora foi vítima de uma fraude bancária através do sistema PIX, onde valores vultuosos foram desviados de sua conta. O Banco Réu falhou ao não identificar transações atípicas e fora do perfil de consumo do Autor, permitindo a evasão de divisas de forma negligente.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `A instituição financeira foi imediatamente comunicada, mas não acionou o Mecanismo Especial de Devolução (MED) de forma célere, impossibilitando a recuperação dos valores no valor de ${formatCurrency(data.valorDescontos)}.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "II - DO DIREITO", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            text: `Súmula 479 do STJ: 'As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias'. O Banco detém o ônus de garantir a segurança do sistema de pagamentos instantâneos.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `A responsabilidade é objetiva e independe de culpa, baseada no risco da atividade. O defeito no serviço reside na insuficiência dos filtros de segurança contra fraudes cibernéticas.`,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
        }),
        new Paragraph({ text: "III - DOS PEDIDOS", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({ text: `1. Restituição integral do valor de ${formatCurrency(data.valorDescontos)};`, bullet: { level: 0 } }),
        new Paragraph({ text: `2. Indenização por danos morais punitivos de ${formatCurrency(data.danoMoral)};`, bullet: { level: 0 } }),
        new Paragraph({ text: `3. Indenização pelo tempo desperdiçado de R$ 2.000,00.`, bullet: { level: 0 } }),
        new Paragraph({
            text: `Dá-se à causa o valor de ${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)}).`,
            spacing: { before: 400 },
        }),
        ...getSignature(office, dataHoje),
    ];
};
