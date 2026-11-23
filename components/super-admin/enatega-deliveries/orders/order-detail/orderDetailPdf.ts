import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_FONT, registerPdfFont } from '@/lib/download';

export type PdfRow = [label: string, value: string];

export interface OrderPdfSection {
  title: string;
  rows: PdfRow[];
}

export interface OrderPdfNote {
  title: string;
  body: string;
  /** Internal notes get a highlighted box so they are not mistaken for customer text. */
  isInternal?: boolean;
  internalLabel?: string;
}

export interface OrderPdfTable {
  title: string;
  head: string[];
  body: string[][];
  /** Columns from this index onward are right-aligned (amounts). */
  numericFrom?: number;
}

/** Every string arrives translated and formatted, so this file only lays it out. */
export interface OrderPdfContent {
  fileName: string;
  brand: string;
  title: string;
  orderCode: string;
  status: string;
  generatedAt: string;
  highlights: PdfRow[];
  sections: OrderPdfSection[];
  items: OrderPdfTable;
  totals: PdfRow[];
  grandTotal: PdfRow;
  earnings: OrderPdfSection | null;
  notes: OrderPdfNote[];
  timeline: OrderPdfTable | null;
  footer: string;
  pageLabel: (page: number, total: number) => string;
}

type Rgb = [number, number, number];
const BRAND: Rgb = [102, 192, 242];
const INK: Rgb = [20, 24, 31];
const MUTED: Rgb = [102, 112, 133];
const LINE: Rgb = [226, 232, 240];
const SOFT: Rgb = [244, 248, 252];
const AMBER_BG: Rgb = [255, 247, 230];
const AMBER_LINE: Rgb = [245, 180, 70];

const PAGE_MARGIN = 14;
const HEADING_GAP = 9;

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

export async function downloadOrderDetailPdf(content: OrderPdfContent) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) as DocWithTable;
  await registerPdfFont(doc);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let y = drawHeader(doc, content, pageWidth);

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = PAGE_MARGIN + 4;
    }
  };

  // Keep a heading with at least its table header and first rows.
  const sectionTitle = (title: string) => {
    ensureSpace(34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(title, PAGE_MARGIN, y);
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.6);
    doc.line(PAGE_MARGIN, y + 1.8, PAGE_MARGIN + 12, y + 1.8);
    y += 4.5;
  };

  const afterTable = () => {
    y = (doc.lastAutoTable?.finalY ?? y) + HEADING_GAP;
  };

  const keyValueTable = (rows: PdfRow[]) => {
    autoTable(doc, {
      startY: y,
      body: rows,
      theme: 'plain',
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { font: PDF_FONT, fontSize: 9, cellPadding: { top: 1.6, bottom: 1.6, left: 0, right: 2 }, textColor: INK, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 48, textColor: MUTED } },
    });
    afterTable();
  };

  // Highlights: shaded boxes with the facts admins look for first.
  if (content.highlights.length) {
    const gap = 3;
    const count = content.highlights.length;
    const boxWidth = (contentWidth - gap * (count - 1)) / count;
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(9.5);
    const wrapped = content.highlights.map(([, value]) =>
      (doc.splitTextToSize(value || '-', boxWidth - 7) as string[]).slice(0, 2),
    );
    const boxHeight = 11 + Math.max(...wrapped.map((lines) => lines.length)) * 4.2;
    content.highlights.forEach(([label], index) => {
      const x = PAGE_MARGIN + index * (boxWidth + gap);
      doc.setFillColor(...SOFT);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(label.toUpperCase(), x + 3.5, y + 5.5);
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(wrapped[index], x + 3.5, y + 10.5);
    });
    y += boxHeight + HEADING_GAP;
  }

  for (const section of content.sections) {
    if (!section.rows.length) continue;
    sectionTitle(section.title);
    keyValueTable(section.rows);
  }

  // Items with the money breakdown directly underneath. autoTable moves a
  // short table to the next page whole, so do the same for its heading.
  const itemRows = content.items.body.length + content.totals.length + 1;
  ensureSpace(Math.min(12 + itemRows * 8.5, 90));
  sectionTitle(content.items.title);
  const numericFrom = content.items.numericFrom ?? content.items.head.length;
  autoTable(doc, {
    startY: y,
    head: [content.items.head],
    body: content.items.body,
    foot: [
      ...content.totals.map(([label, value]) => footRow(content.items.head.length, label, value, false)),
      footRow(content.items.head.length, content.grandTotal[0], content.grandTotal[1], true),
    ],
    theme: 'grid',
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { font: PDF_FONT, fontSize: 9, cellPadding: 2.4, lineColor: LINE, lineWidth: 0.2, textColor: INK, overflow: 'linebreak' },
    headStyles: { font: 'helvetica', fontStyle: 'bold', fillColor: BRAND, textColor: [255, 255, 255] },
    // The embedded font has no bold weight, so foot cells must stay 'normal'.
    footStyles: { font: PDF_FONT, fontStyle: 'normal', fillColor: [255, 255, 255], textColor: INK, lineWidth: 0 },
    columnStyles: Object.fromEntries(
      content.items.head.map((_, index) => [index, index >= numericFrom ? { halign: 'right' as const, cellWidth: 28 } : {}]),
    ),
    showFoot: 'lastPage',
  });
  afterTable();

  if (content.earnings?.rows.length) {
    sectionTitle(content.earnings.title);
    keyValueTable(content.earnings.rows);
  }

  for (const note of content.notes) {
    sectionTitle(note.title);
    // Measure with the font the body is drawn in, or lines wrap early.
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(note.body, contentWidth - 8) as string[];
    const height = lines.length * 4.4 + (note.isInternal ? 11 : 7);
    ensureSpace(height + 4);
    doc.setFillColor(...(note.isInternal ? AMBER_BG : SOFT));
    doc.setDrawColor(...(note.isInternal ? AMBER_LINE : LINE));
    doc.setLineWidth(0.3);
    doc.roundedRect(PAGE_MARGIN, y, contentWidth, height, 2, 2, 'FD');
    let textY = y + 5.5;
    if (note.isInternal && note.internalLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 90, 0);
      doc.text(note.internalLabel.toUpperCase(), PAGE_MARGIN + 4, textY);
      textY += 4.5;
    }
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(lines, PAGE_MARGIN + 4, textY);
    y += height + HEADING_GAP;
  }

  if (content.timeline?.body.length) {
    sectionTitle(content.timeline.title);
    autoTable(doc, {
      startY: y,
      head: [content.timeline.head],
      body: content.timeline.body,
      theme: 'striped',
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { font: PDF_FONT, fontSize: 8.5, cellPadding: 2.2, textColor: INK, overflow: 'linebreak' },
      headStyles: { font: 'helvetica', fontStyle: 'bold', fillColor: [234, 241, 248], textColor: INK },
      alternateRowStyles: { fillColor: [250, 252, 254] },
      columnStyles: { 0: { cellWidth: 34 }, 1: { cellWidth: 30 }, 2: { cellWidth: 38 } },
    });
    afterTable();
  }

  drawFooters(doc, content, pageWidth, pageHeight);
  doc.save(`${content.fileName}.pdf`);
}

function footRow(columns: number, label: string, value: string, isTotal: boolean) {
  const style = isTotal
    ? { fontStyle: 'bold' as const, font: 'helvetica', fontSize: 10.5, fillColor: SOFT }
    : { textColor: MUTED };
  return [
    ...Array.from({ length: Math.max(columns - 2, 0) }, () => ({ content: '', styles: isTotal ? { fillColor: SOFT } : {} })),
    { content: label, styles: { ...style, halign: 'right' as const } },
    { content: value, styles: { ...style, halign: 'right' as const, textColor: INK, font: PDF_FONT, fontStyle: 'normal' as const } },
  ];
}

function drawHeader(doc: jsPDF, content: OrderPdfContent, pageWidth: number) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(content.brand, PAGE_MARGIN, 18);
  doc.setTextColor(...BRAND);
  doc.text('.', PAGE_MARGIN + doc.getTextWidth(content.brand), 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(content.title, PAGE_MARGIN, 24.5);

  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(content.orderCode, pageWidth - PAGE_MARGIN, 17, { align: 'right' });

  // Status pill, right aligned under the order number.
  doc.setFontSize(8);
  const pillWidth = doc.getTextWidth(content.status) + 7;
  const pillX = pageWidth - PAGE_MARGIN - pillWidth;
  doc.setFillColor(232, 245, 253);
  doc.roundedRect(pillX, 20.5, pillWidth, 5.6, 2.8, 2.8, 'F');
  doc.setTextColor(30, 110, 160);
  doc.text(content.status, pillX + pillWidth / 2, 24.3, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(content.generatedAt, pageWidth - PAGE_MARGIN, 31, { align: 'right' });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, 34, pageWidth - PAGE_MARGIN, 34);
  return 41;
}

function drawFooters(doc: jsPDF, content: OrderPdfContent, pageWidth: number, pageHeight: number) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, pageHeight - 12, pageWidth - PAGE_MARGIN, pageHeight - 12);
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(content.footer, PAGE_MARGIN, pageHeight - 7);
    doc.text(content.pageLabel(page, total), pageWidth - PAGE_MARGIN, pageHeight - 7, { align: 'right' });
  }
}
