import {
    Paragraph,
    TextRun,
    AlignmentType,
    Header,
    Footer,
    ImageRun,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from "docx";
import { OfficeData } from "@/types/petition";

const FONT_FAMILY = "Arial";

export async function base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
    const base64Data = base64.split(",")[1] || base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function fetchImageAsArrayBuffer(imagePath: string): Promise<ArrayBuffer> {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return await blob.arrayBuffer();
}

export function generateWaveImageBase64(color: string): Promise<string> {
    return new Promise((resolve) => {
        try {
            const cleanColor = color || "#10b981";
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="150" viewBox="0 0 800 150"><path fill="${cleanColor}" d="M0,0 L800,0 L800,100 Q600,150 400,90 Q200,30 0,80 Z" opacity="0.15"/><path fill="${cleanColor}" d="M0,0 L800,0 L800,70 Q600,120 400,60 Q200,0 0,50 Z" opacity="0.3"/><path fill="${cleanColor}" d="M0,0 L800,0 L800,40 Q600,90 400,30 Q200,-30 0,20 Z" opacity="0.6"/></svg>`;
            
            const img = new Image();
            img.crossOrigin = "Anonymous";
            
            const timeout = setTimeout(() => {
                resolve('');
            }, 3000);

            img.onload = () => {
                clearTimeout(timeout);
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 800;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        resolve('');
                    }
                } catch (e) {
                    resolve('');
                }
            };
            img.onerror = () => {
                clearTimeout(timeout);
                resolve('');
            };
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        } catch (e) {
            resolve('');
        }
    });
}

export function createDocumentHeader(office: OfficeData, logoData: ArrayBuffer | null, headerImageData?: ArrayBuffer | null): Header {
    const primaryColor = (office.primaryColor || "#000000").replace("#", "");
    
    const tableCells = [];

    // Left Cell: Office Name and OAB
    tableCells.push(
        new TableCell({
            width: { size: logoData ? 60 : 100, type: WidthType.PERCENTAGE },
            borders: { 
                top: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                left: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                right: { style: BorderStyle.NONE, size: 0, color: "auto" } 
            },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: office.name.toUpperCase(),
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                            color: primaryColor
                        }),
                    ],
                }),
                ...(office.oabNumbers ? [
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        spacing: { before: 50 },
                        children: [
                            new TextRun({
                                text: office.oabNumbers,
                                font: "Times New Roman",
                                size: 18,
                                color: "555555"
                            }),
                        ],
                    })
                ] : [])
            ]
        })
    );

    // Right Cell: Logo (if available)
    if (logoData) {
        tableCells.push(
            new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: { 
                    top: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                    left: { style: BorderStyle.NONE, size: 0, color: "auto" }, 
                    right: { style: BorderStyle.NONE, size: 0, color: "auto" } 
                },
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new ImageRun({
                                data: logoData,
                                transformation: { width: 160, height: 60 },
                                type: "png",
                            }),
                        ],
                    })
                ]
            })
        );
    }

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: headerImageData ? { style: BorderStyle.NONE, size: 0, color: "auto" } : { style: BorderStyle.SINGLE, size: 24, color: primaryColor },
            bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
            left: { style: BorderStyle.NONE, size: 0, color: "auto" },
            right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
            new TableRow({ children: tableCells })
        ],
    });

    const headerChildren: any[] = [];

    // If there is a background image, place it behind everything
    if (headerImageData) {
        headerChildren.push(
            new Paragraph({
                children: [
                    new ImageRun({
                        data: headerImageData,
                        transformation: { width: 800, height: 150 }, // Approx full page width
                        floating: {
                            behindDocument: true,
                            allowOverlap: true,
                            wrap: {
                                type: "none" as any,
                                side: "bothSides" as any,
                            },
                            horizontalPosition: {
                                relative: "page" as any,
                                align: "center" as any,
                            },
                            verticalPosition: {
                                relative: "page" as any,
                                align: "top" as any,
                            },
                        },
                        type: "png",
                    }),
                ],
            })
        );
    }

    headerChildren.push(headerTable);
    headerChildren.push(new Paragraph({ spacing: { after: 400 }, children: [] }));

    return new Header({ 
        children: headerChildren
    });
}

export function createDocumentFooter(office: OfficeData): Footer {
    const children: Paragraph[] = [];
    const primaryColor = (office.primaryColor || "#000000").replace("#", "");

    // Horizontal Line - Styled with primary color
    children.push(
        new Paragraph({
            border: {
                top: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
            },
            children: [],
        })
    );

    // Address Line
    const addressParts = [
        office.address,
        office.city && office.state ? `${office.city}/${office.state}` : office.city || office.state,
        office.cep ? `CEP ${office.cep}` : null
    ].filter(Boolean);

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [
                new TextRun({ text: addressParts.join(" - "), font: FONT_FAMILY, size: 16 }),
            ],
        })
    );

    // Contact Line
    const contactParts = [
        office.email,
        office.phone,
        office.website
    ].filter(Boolean);

    if (contactParts.length > 0) {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: contactParts.join(" | "), font: FONT_FAMILY, size: 16 }),
                ],
            })
        );
    }

    // Bottom Accent Bar
    children.push(
        new Paragraph({
            border: {
                bottom: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 24 },
            },
            spacing: { before: 200 },
            children: [],
        })
    );

    return new Footer({ children });
}
