import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
    base64ToArrayBuffer,
    createDocumentHeader,
    createDocumentFooter,
    generateWaveImageBase64
} from "./documentUtils";
import { DEFAULT_OFFICE, OfficeData } from "@/types/petition";
import { formatCurrency, valorPorExtenso } from "./currency";
import {
    getTarifasBancariasChildren,
    getSeguroContratoVeiculosChildren,
    getAtrasoVooChildren,
    getSaudeChildren,
    getGolpePixChildren,
    getDivorcioChildren,
    getUsucapiaoChildren,
    getConcursoChildren,
    getTransitoChildren
} from "@/constants/petition-models";
import { PETITION_TEMPLATES } from "@/constants/templates";

export async function generatePetition(formData: any, selectedTemplateId: string | null) {
    // Refine gender for the document
    const data = { ...formData };
    const firstName = data.nomeCliente.trim().split(' ')[0].toLowerCase();
    const isFemale = firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('na');

    if (data.nacionalidade === "Brasileiro(a)" || !data.nacionalidade) {
        data.nacionalidade = isFemale ? "Brasileira" : "Brasileiro";
    }

    // Refine estadoCivil based on gender (Fixes 'solteiroo' bug)
    if (data.estadoCivil && data.estadoCivil.includes("(a)")) {
        const base = data.estadoCivil.replace("(a)", "");
        data.estadoCivil = isFemale ? base.replace(/o$/, "a") : base;
    }

    let header = undefined;
    let footer = undefined;
    let logoImageData: ArrayBuffer | null = null;
    let headerImageData: ArrayBuffer | null = null;

    let documentChildren: any[] = [];
    let office = DEFAULT_OFFICE;

    // Ensure we load branding if visual identity is enabled
    if (data.visualIdentity !== 'none' && typeof window !== 'undefined') {
        try {
            const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
            const storedActiveId = localStorage.getItem("ajuri_active_profile_id");

            if (storedProfiles) {
                const profiles = JSON.parse(storedProfiles);
                const active = profiles.find((p: any) => p.id === storedActiveId) || profiles[0];
                if (active) {
                    office = { ...DEFAULT_OFFICE, ...active.officeData };
                    if (active.logoImage) {
                        logoImageData = await base64ToArrayBuffer(active.logoImage);
                    }
                    if (active.headerImage) {
                        headerImageData = await base64ToArrayBuffer(active.headerImage);
                    }
                }
            } else {
                const storedOffice = localStorage.getItem("ajuri_office_data");
                if (storedOffice) {
                    office = { ...DEFAULT_OFFICE, ...JSON.parse(storedOffice) };
                }
                const storedLogo = localStorage.getItem("ajuri_logo_image");
                if (storedLogo) {
                    logoImageData = await base64ToArrayBuffer(storedLogo);
                }
            }
        } catch (e) {
            console.error("Failed to load office settings", e);
        }

        // Auto-generate wave background if no header image is provided
        if (!headerImageData) {
            try {
                const waveB64 = await generateWaveImageBase64(office.primaryColor || "#10b981");
                if (waveB64) {
                    headerImageData = await base64ToArrayBuffer(waveB64);
                }
            } catch (e) {
                console.error("Failed to generate wave background", e);
            }
        }

        // Generate Header and Footer
        header = createDocumentHeader(office, logoImageData, headerImageData);
        footer = createDocumentFooter(office);
    }

    if (selectedTemplateId === "tarifas-bancarias" || selectedTemplateId === "TARIFAS_INDEVIDAS") {
        documentChildren = getTarifasBancariasChildren(data, office);
    } else if (selectedTemplateId === "seguro-contrato-veiculos") {
        documentChildren = getSeguroContratoVeiculosChildren(data, office);
    } else if (selectedTemplateId === "atraso-voo" || selectedTemplateId === "ATRASO_VOO") {
        documentChildren = getAtrasoVooChildren(data, office);
    } else if (selectedTemplateId === "plano-saude-cirurgia" || selectedTemplateId === "SAUDE_CIRURGIA") {
        documentChildren = getSaudeChildren(data, office);
    } else if (selectedTemplateId === "golpe-pix" || selectedTemplateId === "GOLPE_PIX") {
        documentChildren = getGolpePixChildren(data, office);
    } else if (selectedTemplateId === "divorcio-consensual" || selectedTemplateId === "DIVORCIO_CONSENSUAL") {
        documentChildren = getDivorcioChildren(data, office);
    } else if (selectedTemplateId === "usucapiao-extrajudicial" || selectedTemplateId === "USUCAPIAO_EXTRAJUDICIAL") {
        documentChildren = getUsucapiaoChildren(data, office);
    } else if (selectedTemplateId === "liminar-concurso" || selectedTemplateId === "MS_CONCURSO") {
        documentChildren = getConcursoChildren(data, office);
    } else if (selectedTemplateId === "multa-transito" || selectedTemplateId === "MULTA_TRANSITO") {
        documentChildren = getTransitoChildren(data, office);
    } else {
        // Generic fallback for other templates
        const descontosDobro = Number(data.valorDescontos || 0) * 2;
        const danosTotais = descontosDobro + Number(data.danoMoral || 0);

        documentChildren = [
            new Paragraph({
                text: "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE ...",
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${data.nomeCliente.toUpperCase()}`,
                        bold: true,
                    }),
                    new TextRun(`, ${data.nacionalidade}, ${data.estadoCivil}, ${data.profissao}, portador(a) do RG nº ${data.rgCliente} e inscrito(a) no CPF/MF sob o nº ${data.cpfCliente}, residente e domiciliado(a) na ${data.enderecoCliente}, Bairro ${data.bairroCliente}, CEP ${data.cepCliente}, vem, respeitosamente, à presença de Vossa Excelência, propor a presente:`),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: (PETITION_TEMPLATES.find(t => t.id === selectedTemplateId)?.title || "PETIÇÃO JURÍDICA").toUpperCase(),
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun("Em face de "),
                    new TextRun({
                        text: `${data.requeridoNome.toUpperCase()}`,
                        bold: true,
                    }),
                    new TextRun(`, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${data.cnpjRequerido}, com sede em ${data.enderecoRequerido}, pelos fatos e fundamentos a seguir expostos:`),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "DOS FATOS",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 100 },
            }),
            new Paragraph({
                text: `O Autor foi surpreendido com descontos indevidos em sua conta bancária/benefício previdenciário sob a rubrica "${data.nomeDesconto}", no valor de ${formatCurrency(data.valorDescontos)} (${valorPorExtenso(data.valorDescontos)}).`,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: `Tais descontos são ilegais e abusivos, visto que jamais houve contratação de tal serviço por parte do Autor.`,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: "DOS PEDIDOS",
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 100 },
            }),
            new Paragraph({
                text: "Diante do exposto, requer:",
                spacing: { after: 100 },
            }),
            new Paragraph({
                text: `a) A procedência total da ação com a declaração de inexistência do débito e condenação da Ré à restituição em dobro dos valores descontados, totalizando ${formatCurrency(descontosDobro)} (${valorPorExtenso(descontosDobro)});`,
                bullet: { level: 0 },
            }),
            new Paragraph({
                text: `b) A condenação da Ré ao pagamento de indenização por danos morais pedagógicos no valor de ${formatCurrency(data.danoMoral)} (${valorPorExtenso(data.danoMoral)});`,
                bullet: { level: 0 },
            }),
            new Paragraph({
                text: `Dá-se à causa o valor de ${formatCurrency(danosTotais)} (${valorPorExtenso(danosTotais)}).`,
                spacing: { before: 400 },
            }),
            new Paragraph({
                text: `${data.comarca && data.comarca.includes('/') ? data.comarca : `${data.comarca || office.city || "Sua Cidade"} / ${office.state || "UF"}`}, ${new Date().toLocaleDateString('pt-BR')}.`,
                alignment: AlignmentType.RIGHT,
                spacing: { before: 800, after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: office.name.toUpperCase(), bold: true, size: 24 }),
                ],
                alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
                text: office.oabNumbers || "OAB/AM ______",
                alignment: AlignmentType.RIGHT,
            }),
        ];
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                }
            },
            headers: header ? { default: header } : undefined,
            footers: footer ? { default: footer } : undefined,
            children: documentChildren,
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}
