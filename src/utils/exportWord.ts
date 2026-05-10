import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { Packer } from "docx";
import { PetitionData, DEFAULT_OFFICE } from "@/types/petition";
import { formatCurrency, formatDateShort, formatDate, formatCurrencyExtensoOnly } from "@/utils/formatters";
import { getPetitionContent } from "./petitionTemplates";
import { base64ToArrayBuffer, fetchImageAsArrayBuffer, createDocumentHeader, createDocumentFooter } from "./documentUtils";

const FONT_FAMILY = "Arial";
const FONT_SIZE_NORMAL = 24; // 12pt in half-points
const FONT_SIZE_SMALL = 20; // 10pt


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
      line: options?.spacing?.line ?? 360, // 1.5 line spacing
    },
    indent: options?.indent,
  });
}

export async function exportToWord(data: PetitionData, selectedProfileId?: string): Promise<void> {
  const { client, bank, charges, moralDamage, wastedTimeDamage, chargeDescription } = data;

  // Determine office data from storage or default
  let office = DEFAULT_OFFICE;
  let logoImageData: ArrayBuffer | null = null;

  // Safe check for window/localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
      const storedActiveId = selectedProfileId || localStorage.getItem("ajuri_active_profile_id");

      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        const active = profiles.find((p: any) => p.id === storedActiveId) || profiles[0];

        if (active) {
          office = { ...DEFAULT_OFFICE, ...active.officeData };
          if (active.logoImage) {
            logoImageData = await base64ToArrayBuffer(active.logoImage);
          }
        }
      } else {
        // Fallback para chaves antigas (migração legada)
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
  }

  // Fallback to default Sena logo if no user logo and using default office
  if (!logoImageData && office.name === DEFAULT_OFFICE.name) {
    try {
      const logoModule = await import("@/assets/header-sena.png");
      const getSrc = (mod: any) => {
        const def = mod.default || mod;
        return typeof def === 'string' ? def : (def.src || "");
      };
      const src = getSrc(logoModule);
      if (src) logoImageData = await fetchImageAsArrayBuffer(src);
    } catch (err) {
      console.warn("Default logo not found");
    }
  }

  // ========== DYNAMIC HEADER & FOOTER ==========
  const header = createDocumentHeader(office, logoImageData);
  const footer = createDocumentFooter(office);

  // ========== DOCUMENT CONTENT ==========
  const documentChildren = getPetitionContent(data, office);

  // DATA E LOCAL (Sempre ao final)
  documentChildren.push(
    createParagraph(
      [createTextRun(`${client.city || "Manaus"} / ${client.state || "AM"}, ${formatDate(data.dateOfPetition)}`)],
      { alignment: AlignmentType.CENTER, spacing: { before: 600 } }
    )
  );

  // ASSINATURA
  documentChildren.push(
    createParagraph(
      [
        createTextRun("\n\n________________________________________________\n", { bold: true }),
        createTextRun(office.name || "NOME DO ADVOGADO", { bold: true, size: FONT_SIZE_SMALL }),
        createTextRun(`\n${office.oabNumbers || "OAB/AM 00.000"}`, { size: FONT_SIZE_SMALL }),
      ],
      { alignment: AlignmentType.CENTER, spacing: { before: 200 } }
    )
  );

  // ===== ANEXOS - SCREENSHOTS =====
  if (data.chargeScreenshots && data.chargeScreenshots.length > 0) {
    documentChildren.push(
      createParagraph([createTextRun("ANEXO - PRINTS DOS DESCONTOS", { bold: true })],
        { alignment: AlignmentType.CENTER, spacing: { before: 800, after: 400 } })
    );

    for (let i = 0; i < data.chargeScreenshots.length; i++) {
      try {
        const imageData = await base64ToArrayBuffer(data.chargeScreenshots[i]);
        documentChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [
              new ImageRun({
                data: imageData,
                transformation: { width: 450, height: 280 },
                type: "png",
              }),
            ],
          })
        );
        documentChildren.push(
          createParagraph([createTextRun(`Print ${i + 1}`, { italics: true, size: FONT_SIZE_SMALL })],
            { alignment: AlignmentType.CENTER })
        );
      } catch (error) {
        console.error("Error adding image:", error);
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: documentChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `peticao_${client.name?.replace(/\s+/g, "_") || "documento"}_${new Date().toISOString().split("T")[0]}.docx`);
}
