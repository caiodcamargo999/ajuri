// Removed top-level import to avoid build errors (ReferenceError: self is not defined)
// import html2pdf from 'html2pdf.js';
import { formatCurrency, valorPorExtenso } from './currency';
import { PETITION_TEMPLATES } from '@/constants/templates';
import { DEFAULT_OFFICE, OfficeData } from '@/types/petition';
import { generateWaveImageBase64 } from './documentUtils';

export async function generatePetitionPDF(formData: any, selectedTemplateId: string | null, selectedProfileId?: string) {
    if (typeof window === 'undefined') return;

    try {
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;

        if (typeof html2pdf !== 'function') {
            throw new Error(`Biblioteca PDF inválida: ${typeof html2pdf}`);
        }

        const data = {
            ...formData,
            client: formData.client || {},
            charges: formData.charges || []
        };

        // Refine gender and civil status for the document (Fixes 'solteiroo' bug)
        const firstName = data.nomeCliente?.trim().split(' ')[0].toLowerCase() || "";
        const isFemale = firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('na');

        if (data.nacionalidade === "Brasileiro(a)" || !data.nacionalidade) {
            data.nacionalidade = isFemale ? "Brasileira" : "Brasileiro";
        }

        if (data.estadoCivil && data.estadoCivil.includes("(a)")) {
            const base = data.estadoCivil.replace("(a)", "");
            data.estadoCivil = isFemale ? base.replace(/o$/, "a") : base;
        }

        let office = DEFAULT_OFFICE;
        let logoImage = "";
        let headerImage = "";

        try {
            const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
            const storedActiveId = selectedProfileId || localStorage.getItem("ajuri_active_profile_id");

            if (storedProfiles) {
                const profiles = JSON.parse(storedProfiles);
                const active = profiles.find((p: any) => p.id === storedActiveId) || profiles[0];
                if (active) {
                    office = { ...DEFAULT_OFFICE, ...active.officeData };
                    logoImage = active.logoImage || "";
                    headerImage = active.headerImage || "";
                }
            } else {
                const storedOffice = localStorage.getItem("ajuri_office_data");
                if (storedOffice) {
                    office = { ...DEFAULT_OFFICE, ...JSON.parse(storedOffice) };
                }
                const storedLogo = localStorage.getItem("ajuri_logo_image");
                if (storedLogo) {
                    logoImage = storedLogo;
                }
            }
        } catch (e) {
            console.error("Failed to load office settings", e);
        }

        // Auto generate wave background
        if (!headerImage) {
            try {
                headerImage = await generateWaveImageBase64(office.primaryColor || "#10b981");
            } catch(e) {
                console.error("Failed to generate wave for PDF", e);
            }
        }

        const template = PETITION_TEMPLATES.find(t => t.id === selectedTemplateId);
        const title = (template?.title || "PETIÇÃO JURÍDICA").toUpperCase();
        const primaryColor = office.primaryColor || "#10b981";

        // Main Content Container
        const container = document.createElement('div');
        container.style.padding = '0';
        container.style.width = '210mm'; // Use exact A4 width
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const content = document.createElement('div');
        content.id = 'pdf-content-to-render';
        content.style.fontFamily = "'Times New Roman', serif";
        content.style.color = '#000';
        content.style.fontSize = '12pt';
        content.style.lineHeight = '1.8'; // Better legal formatting
        content.style.padding = '0 20mm'; // Side padding only, top/bottom handled by opt.margin
        container.appendChild(content);

        let contentHtml = "";
        const fmt = (val: any) => formatCurrency(Number(val) || 0);
        const fmtExt = (val: any) => valorPorExtenso(Number(val) || 0);

        // Normalize template ID
        const templateKey = selectedTemplateId || "";

        if (templateKey === 'tarifas-bancarias' || templateKey === 'TARIFAS_INDEVIDAS') {
            const totalCharges = data.charges?.reduce((sum: number, c: any) => sum + Number(c.value || 0), 0) || Number(data.valorDescontos || 0);
            const doubleReturn = totalCharges * 2;
            const wastedTimeDamage = Number(data.wastedTimeDamage || 2000);
            const totalCauseValue = doubleReturn + Number(data.danoMoral || 0) + wastedTimeDamage;

            let chargesTableHtml = "";
            if (data.charges && data.charges.length > 0) {
                chargesTableHtml = `
                    <div style="margin: 25px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
                            <thead>
                                <tr style="background-color: #f8f9fa; border-bottom: 2px solid #000;">
                                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Data</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Descrição</th>
                                    <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.charges.map((c: any) => `
                                    <tr>
                                        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${c.date ? new Date(c.date).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${c.description || '-'}</td>
                                        <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${fmt(c.value)}</td>
                                    </tr>
                                `).join('')}
                                <tr style="font-weight: bold; background-color: #f8f9fa;">
                                    <td colspan="2" style="padding: 10px; text-align: right; border: 1px solid #000;">TOTAL</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #000;">${fmt(totalCharges)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                chargesTableHtml = `
                    <div style="text-align: center; padding: 15px; border: 1px solid #ddd; margin: 20px 0; background: #fafafa;">
                        [VER PLANILHA ANALÍTICA DE DÉBITOS EM ANEXO]
                    </div>
                `;
            }

            contentHtml = `
                <p style="text-align: center; margin-bottom: 60px; font-weight: bold; font-size: 13pt;">
                    AO JUÍZO DE DIREITO DA VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ${data.comarca?.toUpperCase() || "________________"}
                </p>

                <div style="text-align: justify; margin-bottom: 30px;">
                    <p style="text-indent: 50px; margin-bottom: 20px;">
                        <b>${data.nomeCliente?.toUpperCase() || ""}</b>, ${data.nacionalidade || "brasileiro(a)"}, ${data.estadoCivil || "solteiro(a)"}, 
                        ${data.profissao || "autônomo(a)"}, inscrito(a) no CPF nº ${data.cpfCliente || ""}, RG nº ${data.rgCliente || ""}, residente 
                        e domiciliado(a) no ${data.enderecoCliente || ""}, Bairro: ${data.bairroCliente || ""}, CEP: ${data.cepCliente || ""}, 
                        ${data.comarca || office.city || ""}, por intermédio de seu 
                        advogado, legalmente constituído, com escritório profissional na ${office.address}, 
                        onde recebe intimações e notificações, com base nos artigos 319 e 
                        seguintes do Código de Processo Civil, bem como no art. 5º, V, CRFB/88 e 
                        demais dispositivos legais previstos no Código de Defesa do Consumidor e 
                        na Autorregulação Bancária propor:
                    </p>
                </div>

                <div style="text-align: center; font-weight: bold; margin: 40px 0; border: 2pt solid #000; padding: 20px; font-size: 14pt; background-color: #fcfcfc;">
                    AÇÃO DE RESPONSABILIDADE CIVIL C/C INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS POR COBRANÇA INDEVIDA
                </div>

                <p style="margin-bottom: 40px; text-align: justify;">
                    em face de <b>${data.requeridoNome?.toUpperCase() || "REQUERIDO"}</b>, pessoa jurídica de direito privado, com 
                    registro no CNPJ sob o nº ${data.cnpjRequerido || ""}, com sede na cidade de 
                    ${data.enderecoRequerido || ""}, pelas razões de fato e de direito que passa a 
                    expor:
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">I - DOS FATOS</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A parte Autora mantém vínculo contratual com a instituição financeira conforme comprovado, todavia, ao proceder à conferência de 
                    seus extratos, descobriu que havia uma cobrança recorrente denominada <b>${data.nomeDesconto || "TARIFAS BANCÁRIAS"}</b>, sem que houvesse qualquer solicitação, anuência ou 
                    assinatura de contrato específico que legitimasse tais cobranças.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Evidencia-se, assim, a <b>ocorrência de descontos unilaterais e abusivos</b>, perpetrados em flagrante desrespeito aos princípios da 
                    lealdade contratual, da informação e da confiança, que regem as relações de consumo.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Ressalte-se que <b>a parte autora jamais solicitou ou anuiu com a contratação de qualquer plano ou serviço adicional</b> que pudesse 
                    justificar tais cobranças, tratando-se, portanto, de <b>descontos unilaterais e abusivos</b>.
                </p>
                <p style="text-align: justify; margin-bottom: 15px;">
                    Com base na tabela analítica obtida dos extratos bancários, detalham-se os valores questionados:
                </p>

                ${chargesTableHtml}

                <p style="text-align: justify; text-indent: 50px; margin-bottom: 25px;">
                    Neste sentido, os valores cobrados INDEVIDAMENTE soma a quantia de <b>${fmt(totalCharges)}</b> 
                    (${fmtExt(totalCharges)}) com repetição do indébito equivalente a 2 x ${fmt(totalCharges)}, totalizando o valor de <b>${fmt(doubleReturn)}</b> 
                    (${fmtExt(doubleReturn)}), em virtude da devolução EM DOBRO conforme Art. 42 do CDC.
                </p>
                
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                   O desconto de valores diversos sem comunicar ao consumidor previamente deixa clara a evidência de que a parte Ré faltou com o DEVER DE INFORMAÇÃO, além de boa fé e confiança.
                </p>

                <p style="text-align: justify; text-indent: 50px; margin-bottom: 40px;">
                    Não restando alternativa a parte Autora, senão socorrer-se do Poder Judiciário para ver declarada a inexistência da relação jurídica que fundamentaria tais cobranças.
                </p>

                <p style="font-weight: bold; margin-bottom: 20px; font-size: 13pt;">II - DO DIREITO</p>
                
                <p style="font-weight: bold; margin-bottom: 10px;">a – DA APLICABILIDADE DO CÓDIGO DE DEFESA DO CONSUMIDOR</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A presente demanda versa sobre relação de consumo, plenamente caracterizada nos termos dos artigos 2º e 3º do 
                    Código de Defesa do Consumidor. O entendimento é consolidado pela Súmula 297 do STJ: "O Código de Defesa do Consumidor é aplicável às instituições financeiras."
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">b – DA COBRANÇA INDEVIDA E DA REPETIÇÃO DO INDÉBITO</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A conduta da Ré ao realizar cobranças mensais por serviços não contratados caracteriza típica prática abusiva. A prestação unilateral de serviços, sem autorização, configura infração à boa-fé objetiva e viola o dever de informação (art. 6º, III, do CDC).
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Conforme o art. 42, parágrafo único do CDC, o consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso.
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">c – DA RESPONSABILIDADE OBJETIVA</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A responsabilidade civil do Banco é objetiva (art. 14 do CDC), baseada no risco da atividade. Basta a comprovação da conduta lesiva, do dano e do nexo causal, prescindindo de culpa.
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">d – DA INVERSÃO DO ÔNUS DA PROVA</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Diante da hipossuficiência técnica, cabe a inversão do ônus da prova (art. 6º, VIII, CDC), competindo ao Banco demonstrar a existência de contratação válida.
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">e - DOS DANOS MATERIAIS</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Requer-se a devolução em dobro dos valores descontados, totalizando <b>${fmt(doubleReturn)}</b>, com juros a partir do evento danoso (Súmula 54 STJ).
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">f – DO DANO MORAL CONFIGURADO</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A cobrança indevida reiterada ultrapassa o mero aborrecimento. O dano moral é <i>in re ipsa</i>. 
                    "(...) o dano moral decorrente dessa conduta é presumido (...)" (TJ-AM, Apelação nº 0624128-78.2022.8.04.0001).
                    Valor requerido: <b>${fmt(data.danoMoral)}</b>.
                </p>

                <p style="font-weight: bold; margin-bottom: 10px;">g – DO TEMPO DESPERDIÇADO (DESVIO PRODUTIVO)</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    O tempo útil do consumidor é bem jurídico. Requer-se indenização de <b>${fmt(wastedTimeDamage)}</b> pelo desvio produtivo causado (STJ, AREsp 1.260.458/SP).
                </p>

                <p style="font-weight: bold; margin-bottom: 20px; font-size: 13pt; margin-top: 40px;">III – DOS PEDIDOS</p>
                <ol style="margin-left: 40px; margin-bottom: 40px; line-height: 1.8;">
                    <li>A concessão da justiça gratuita (art. 98 CPC);</li>
                    <li>A citação do Réu para responder, sob pena de revelia;</li>
                    <li>A inversão do ônus da prova;</li>
                    <li>Declarar a inexistência da contratação e condenar à restituição em dobro: <b>${fmt(doubleReturn)}</b>;</li>
                    <li>Condenar ao pagamento de DANOS MORAIS: <b>${fmt(data.danoMoral)}</b>;</li>
                    <li>Condenar pelo Tempo Desperdiçado: <b>${fmt(wastedTimeDamage)}</b>;</li>
                    <li>Condenação em custas e honorários advocatícios (20%).</li>
                </ol>

                <p style="margin-top: 40px; margin-bottom: 60px;">
                    Dá-se à causa o valor de <b>${fmt(totalCauseValue)}</b> (${fmtExt(totalCauseValue)}).
                </p>

                <div style="text-align: right; margin-top: 60px; page-break-inside: avoid;">
                    <p style="margin-bottom: 40px;">
                        ${data.comarca && data.comarca.includes('/') ? data.comarca : `${data.comarca || office.city || "Sua Cidade"} / ${office.state || "UF"}`}, ${new Date().toLocaleDateString('pt-BR')}.
                    </p>
                    <div style="display: inline-block; text-align: right;">
                        <div style="width: 300px; border-bottom: 1pt solid #000; margin-bottom: 5px; margin-left: auto;"></div>
                        <b>${office.name?.toUpperCase() || ""}</b><br/>
                        ${office.oabNumbers || ""}
                    </div>
                </div>
            `;
        } else if (templateKey === 'seguro-contrato-veiculos') {
            const seguroDobro = Number(data.valorDescontos || 0) * 2;
            const danosMorais = Number(data.danoMoral || 0);
            const totalCauseValue = seguroDobro + danosMorais;

            contentHtml = `
                <p style="text-align: center; margin-bottom: 60px; font-weight: bold; font-size: 13pt;">
                    AO JUIZO DA ___ VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ${data.comarca?.toUpperCase() || "MANAUS – AMAZONAS"}
                </p>

                <div style="text-align: justify; margin-bottom: 30px;">
                    <p style="text-indent: 50px; margin-bottom: 20px;">
                        <b>${data.nomeCliente?.toUpperCase() || ""}</b>, ${data.nacionalidade || "brasileira"}, ${data.estadoCivil || "casada"}, 
                        ${data.profissao || "trabalhadora"}, portadora do CPF n° ${data.cpfCliente || ""}, endereço eletrônico: ${data.emailCliente || ""}, residente 
                        e domiciliada na ${data.enderecoCliente || ""}, n° ${data.numeroEndereco || "S/N"}, Bairro ${data.bairroCliente || ""}, CEP: ${data.cepCliente || ""}, 
                        ${data.comarca || office.city || "Sua Cidade"}, por seus procuradores signatários, ut instrumento procuratório incluso, vem respeitosamente à presença de V.Exa. propor:
                    </p>
                </div>

                <div style="text-align: center; font-weight: bold; margin: 40px 0; border: 2pt solid #000; padding: 20px; font-size: 14pt; background-color: #fcfcfc;">
                    AÇÃO DE INEXIGIBILIDADE DE SEGURO C/C POR DANOS MATERIAIS E MORAIS
                </div>

                <p style="margin-bottom: 40px; text-align: justify;">
                    Em face de <b>${data.requeridoNome?.toUpperCase() || "REQUERIDO"}</b>, pessoa jurídica de direito privado, inscrito no CNPJ ${data.cnpjRequerido || ""}, com sede no ${data.enderecoRequerido || ""}, o que faz pelos fatos e fundamentos a seguir expostos:
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">• DOS FATOS</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A parte Requerente firmou com o Réu, em ${data.dataContrato || "___/___/_____"}, contrato de cédula de crédito bancário n.º ${data.numeroContrato || "_______________"}, para financiamento de veículo em ${data.numeroParcelas || "___"} (${fmtExt(data.numeroParcelas || 0)}) vezes.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Ocorre que, no momento da contratação do financiamento, foi inserido no contrato, sem o livre e esclarecido consentimento do(a) consumidor(a), o produto denominado "${data.nomeDesconto || "SEGURO"}", no valor de R$ ${fmt(data.valorDescontos)} (${fmtExt(data.valorDescontos)}), sem que lhe fosse devidamente explicado o produto, seu custo e muito menos dada a opção de recusa.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Ora, qual consumidor que buscou o requerido para a realização de um financiamento de veículo em ${data.numeroParcelas || "___"} (${fmtExt(data.numeroParcelas || 0)}) vezes, pois não tem condições de pagar em menos tempo, haja vista que as parcelas ficariam elevadas, iria contratar uma tarifa de R$ ${fmt(data.valorDescontos)} (${fmtExt(data.valorDescontos)}) e gerar outros gastos? É infundamentada a linha de raciocínio que acredita que iria.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Causa espanto o fato de a instituição financeira realizar este tipo de conduta conhecida como "venda casada", deixando o consumidor totalmente refém do seu procedimento unilateral, o que não merece prosperar impunemente.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    O dever de informar que não houve no caso em tela representa, no sistema do CDC, um verdadeiro dever essencial, para a harmonia e transparência das relações de consumo.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 40px;">
                    A cobrança consiste numa onerosidade excessiva para o consumidor, ferindo consideravelmente as normas dispostas na legislação protetiva das relações de consumo, bem como, de forma bem especial, do consumidor.
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">• DO DIREITO</p>
                
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A matéria ora discutida encontra amplo respaldo no ordenamento jurídico brasileiro, especialmente no Código de Defesa do Consumidor (Lei nº 8.078/1990) e na jurisprudência consolidada do Superior Tribunal de Justiça.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    O STJ, em sede de recurso repetitivo (REsp. 1.639.259), fixou as seguintes teses:
                </p>
                <p style="text-align: justify; margin-left: 50px; margin-right: 50px; margin-bottom: 15px; font-style: italic;">
                    "1. [...] o correspondente bancário, no âmbito das relações de consumo. 2. TESES FIXADAS PARA OS FINS DO ART. 1.040 DO CPC/2015: 2.1 - Abusividade da cláusula que prevê o ressarcimento pelo consumidor da despesa com o registro do pré-gravame, em contratos celebrados a partir de 25/02/2011, data de entrada em vigor da Res.-CMN 3.954/2011, sendo válida a cláusula pactuada no período anterior a essa resolução, ressalvado o controle da onerosidade excessiva. 2.2 - Nos contratos bancários em geral, o consumidor não pode ser compelido a contratar seguro com a instituição financeira ou com seguradora por ela indicada. 2.3 - A abusividade de encargos acessórios do contrato não descaracteriza a mora."
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Portanto, é expressa e consolidada a proibição de que o consumidor seja compelido a contratar seguro com a instituição financeira ou por ela indicada, sendo nula de pleno direito a cláusula contratual que assim dispõe.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A conduta do(a) requerido(a) configura, ainda, prática de venda casada, expressamente vedada pelo art. 39, inciso I, do CDC, que proíbe o fornecedor de condicionar o fornecimento de produto ou serviço à aquisição de outro produto ou serviço.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 40px;">
                    Nos termos do art. 42, parágrafo único, do CDC, é devida a restituição em dobro dos valores cobrados indevidamente, acrescidos de correção monetária e juros legais, desde a data de cada cobrança.
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">• DOS DANOS MATERIAIS – REPETIÇÃO DO INDÉBITO</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 40px;">
                    Com fundamento no art. 42, parágrafo único, do Código de Defesa do Consumidor, requer-se a restituição em dobro do valor cobrado indevidamente a título de "${data.nomeDesconto || "SEGURO"}", no montante de R$ ${fmt(data.valorDescontos)} (${fmtExt(data.valorDescontos)}), totalizando, com a repetição do indébito, <b>R$ ${fmt(seguroDobro)} (${fmtExt(seguroDobro)})</b>, devidamente corrigido monetariamente e acrescido de juros moratórios desde a data da cobrança.
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">• DOS DANOS MORAIS</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    A conduta do(a) requerido(a), ao impor ao(à) consumidor(a) produto não solicitado e não autorizado, causa dano moral que supera o mero aborrecimento, atingindo a esfera extrapatrimonial do(a) requerente, que se viu vítima de prática abusiva em uma relação que deveria ser pautada pela boa-fé e pela transparência.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Para que além de ser punido pela atitude unilateral que o mesmo teve na presente lide, servirá para que pense mais de uma vez se valerá fazer a mesma ilicitude com outros consumidores.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 15px;">
                    Na fixação do montante devido, o prudente arbítrio do julgador deve considerar os fins pedagógico e punitivo da reparação moral, sem embargo de sopesar as circunstâncias próprias do agravo causado ao consumidor.
                </p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 40px;">
                    Requer-se, portanto, a condenação do(a) requerido(a) ao pagamento de indenização por danos morais no valor não inferior a <b>R$ ${fmt(danosMorais)} (${fmtExt(danosMorais)})</b>.
                </p>

                <p style="font-weight: bold; margin-bottom: 20px; font-size: 13pt;">* DOS PEDIDOS — REQUER</p>
                <ol style="margin-left: 40px; margin-bottom: 40px; line-height: 1.8;">
                    <li>A inversão do ônus da prova ao réu, nos termos do Código de Defesa do Consumidor;</li>
                    <li>A citação do Requerido para, se quiser, responder os atos e termos desta ação, que deverá ser julgada procedente;</li>
                    <li>A Gratuidade da Justiça, eis que não pode demandar em juízo sem prejuízo do sustento próprio e de sua família;</li>
                    <li>A declaração de nulidade e inexigibilidade do "${data.nomeDesconto || "SEGURO"}" no valor de R$ ${fmt(data.valorDescontos)} (${fmtExt(data.valorDescontos)});</li>
                    <li>A devolução em dobro do valor cobrado indevidamente a título de "${data.nomeDesconto || "SEGURO"}", totalizando <b>R$ ${fmt(seguroDobro)} (${fmtExt(seguroDobro)})</b>, devidamente corrigido monetariamente e acrescido de juros legais desde a data da cobrança;</li>
                    <li>A condenação do(a) requerido(a) ao pagamento de indenização por danos morais no valor não inferior a <b>R$ ${fmt(danosMorais)} (${fmtExt(danosMorais)})</b>;</li>
                    <li>A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios;</li>
                    <li>A produção de todos os meios de prova em direito admitidos, especialmente documental.</li>
                </ol>

                <p style="margin-top: 40px; margin-bottom: 40px;">
                    Dá-se à causa o valor de <b>R$ ${fmt(totalCauseValue)} (${fmtExt(totalCauseValue)})</b>.
                </p>
                
                <p style="margin-bottom: 60px;">
                    Nestes termos,<br/>
                    Pede deferimento.
                </p>

                <div style="text-align: right; margin-top: 60px; page-break-inside: avoid;">
                    <p style="margin-bottom: 40px;">
                        ${data.comarca && data.comarca.includes('/') ? data.comarca : `${data.comarca || office.city || "Sua Cidade"} / ${office.state || "UF"}`}, ${new Date().toLocaleDateString('pt-BR')}.
                    </p>
                    <div style="display: inline-block; text-align: right;">
                        <div style="width: 300px; border-bottom: 1pt solid #000; margin-bottom: 5px; margin-left: auto;"></div>
                        <b>${office.name?.toUpperCase() || ""}</b><br/>
                        ${office.oabNumbers || ""}
                    </div>
                </div>
            `;
        } else {
            // General fallback template with better layout
            contentHtml = `
                <p style="text-align: center; margin-bottom: 50px; font-weight: bold; font-size: 13pt;">
                    AO JUÍZO DE DIREITO DA COMARCA DE ${data.comarca?.toUpperCase() || "________________"}
                </p>
                
                <p style="text-align: justify; margin-bottom: 25px; text-indent: 50px;">
                    <b>${data.nomeCliente?.toUpperCase() || ""}</b>, ${data.nacionalidade || ""}, ${data.estadoCivil || ""}, ${data.profissao || ""}, 
                    inscrito(a) no CPF nº ${data.cpfCliente || ""}, RG nº ${data.rgCliente || ""}, residente e domiciliado(a) na ${data.enderecoCliente || ""}, 
                    vem propor:
                </p>

                <div style="text-align: center; font-weight: bold; margin: 40px 0; border: 2pt solid #000; padding: 20px; font-size: 14pt;">
                    ${title}
                </div>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">I - DOS FATOS</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 20px;">
                    ${data.nomeDesconto ? `Trata-se de ação judicial para reparação de danos decorrentes de ${data.nomeDesconto}.` : 'Relato dos fatos conforme documentos anexos.'}
                    O Autor sofreu prejuízos materiais apurados em ${fmt(data.valorDescontos)} e danos morais estimados em ${fmt(data.danoMoral)}.
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">II - DO DIREITO</p>
                <p style="text-align: justify; text-indent: 50px; margin-bottom: 20px;">
                    A pretensão encontra amparo legal no Código de Defesa do Consumidor e na responsabilidade civil objetiva da Ré.
                </p>

                <p style="font-weight: bold; margin-bottom: 15px; font-size: 13pt;">III - DOS PEDIDOS</p>
                <ul style="margin-left: 40px; margin-bottom: 30px;">
                    <li>Procedência total da ação;</li>
                    <li>Condenação em Danos Materiais (${fmt(data.valorDescontos)});</li>
                    <li>Condenação em Danos Morais (${fmt(data.danoMoral)});</li>
                </ul>
                
                <p style="margin-top: 40px;">
                    Dá-se à causa o valor de <b>${fmt(Number(data.valorDescontos || 0) + Number(data.danoMoral || 0))}</b>.
                </p>

                <div style="text-align: right; margin-top: 60px; page-break-inside: avoid;">
                    ${data.comarca && data.comarca.includes('/') ? data.comarca : `${data.comarca || office.city || "Sua Cidade"} / ${office.state || "UF"}`}, ${new Date().toLocaleDateString('pt-BR')}.<br/><br/><br/>
                    <b>${office.name?.toUpperCase() || ""}</b>
                </div>
            `;
        }

        content.innerHTML = contentHtml;

        // Visual Identity Styles (Header/Footer for manual drawing)
        const headerEl = document.createElement('div');
        headerEl.style.width = '210mm';
        headerEl.style.minHeight = '30mm'; // Ensure at least some height
        headerEl.style.padding = '10mm 20mm';
        headerEl.style.backgroundColor = '#fff';
        headerEl.style.position = 'absolute';
        headerEl.style.left = '-9999px';
        headerEl.style.boxSizing = 'border-box';
        headerEl.style.display = 'flex';
        headerEl.style.flexDirection = 'column';
        headerEl.style.justifyContent = 'center';
        document.body.appendChild(headerEl);

        if (data.visualIdentity !== 'none') {
            if (headerImage) {
                headerEl.style.padding = '0';
                headerEl.innerHTML = `
                    <div style="position: relative; width: 100%;">
                        <img src="${headerImage}" style="width: 210mm; display: block;" />
                        <div style="position: absolute; top: 10mm; left: 20mm; right: 20mm; display: flex; align-items: center; justify-content: space-between; z-index: 10;">
                            <div style="flex: 2; text-align: left; font-family: 'Times New Roman', serif;">
                                ${office.name ? `<div style="font-size: 16pt; font-weight: bold; color: ${primaryColor}; margin-bottom: 2pt;">${office.name.toUpperCase()}</div>` : ''}
                                ${office.oabNumbers ? `<div style="font-size: 11pt; color: #555;">${office.oabNumbers}</div>` : ''}
                            </div>
                            <div style="flex: 1; text-align: right;">
                                ${logoImage ? `<img src="${logoImage}" style="max-height: 25mm; max-width: 65mm; object-fit: contain;" />` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                headerEl.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 8pt solid ${primaryColor}; padding-top: 5mm;">
                        <div style="flex: 2; text-align: left; font-family: 'Times New Roman', serif;">
                            <div style="font-size: 16pt; font-weight: bold; color: ${primaryColor}; margin-bottom: 2pt;">${office.name?.toUpperCase() || ""}</div>
                            <div style="font-size: 11pt; color: #555;">${office.oabNumbers || ""}</div>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            ${logoImage ? `<img src="${logoImage}" style="max-height: 25mm; max-width: 65mm; object-fit: contain;" />` : ''}
                        </div>
                    </div>
                `;
            }
        }

        const footerEl = document.createElement('div');
        footerEl.style.width = '210mm';
        footerEl.style.padding = '5mm 20mm 10mm 20mm';
        footerEl.style.backgroundColor = '#fff';
        footerEl.style.position = 'absolute';
        footerEl.style.left = '-9999px';
        footerEl.style.boxSizing = 'border-box';
        document.body.appendChild(footerEl);

        if (data.visualIdentity !== 'none') {
            const addressParts = [
                office.address,
                office.city && office.state ? `${office.city}/${office.state}` : office.city || office.state,
                office.cep ? `CEP ${office.cep}` : null
            ].filter(Boolean);

            footerEl.innerHTML = `
                <div style="border-top: 1pt solid ${primaryColor}; padding-top: 3mm; text-align: center; font-family: sans-serif;">
                    <div style="font-size: 8.5pt; color: #555; line-height: 1.4;">
                        ${addressParts.join(" - ")}<br/>
                        ${[office.email, office.phone, office.website].filter(Boolean).join(" | ")}
                    </div>
                    <div style="height: 1.5mm; background-color: ${primaryColor}; margin-top: 3mm; border-radius: 1mm;"></div>
                </div>
            `;
        }

        // Capture Header and Footer as images
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default || html2canvasModule;

        const canvasOptions = {
            scale: 4,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        };

        const headerCanvas = await html2canvas(headerEl, canvasOptions);
        const footerCanvas = await html2canvas(footerEl, canvasOptions);

        const headerImg = data.visualIdentity !== 'none' ? headerCanvas.toDataURL('image/png') : null;
        const footerImg = data.visualIdentity !== 'none' ? footerCanvas.toDataURL('image/png') : null;

        // Calculate heights in mm to maintain aspect ratio
        const headerWidthMm = 210;
        const headerHeightMm = headerImg ? (headerWidthMm / headerCanvas.width) * headerCanvas.height : 0;
        const footerWidthMm = 210;
        const footerHeightMm = footerImg ? (footerWidthMm / footerCanvas.width) * footerCanvas.height : 0;

        // Configuration for html2pdf
        const opt = {
            margin: [70, 10, 45, 10], // Top margin MUST be larger than headerHeightMm + 10
            filename: `Peticao_${(data.nomeCliente || "Cliente").replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: canvasOptions,
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const, compress: true },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and process PDF
        const worker = html2pdf().from(content).set(opt);

        await worker.toPdf().get('pdf').then((pdf: any) => {
            const totalPages = pdf.internal.getNumberOfPages();

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);

                // Add Header (Placed at y=10)
                if (headerImg) {
                    pdf.addImage(headerImg, 'PNG', 0, 10, headerWidthMm, headerHeightMm);
                }

                // Add Footer (Placed at bottom-margin area)
                if (footerImg) {
                    pdf.addImage(footerImg, 'PNG', 0, 297 - footerHeightMm - 10, footerWidthMm, footerHeightMm);
                }
            }
        });

        await (worker as any).save();

        // Cleanup
        document.body.removeChild(container);
        document.body.removeChild(headerEl);
        document.body.removeChild(footerEl);

    } catch (err) {
        console.error("PDF Generation Error:", err);
        throw err;
    }
}
