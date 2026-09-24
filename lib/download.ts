import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Column {
  header: string;
  dataKey: string;
  // Optional: A formatter function if the data needs special handling
  formatter?: (item: Record<string, unknown>) => string;
}

const resolveNestedKey = (
  obj: Record<string, unknown>,
  key: string,
): unknown => {
  return key
    .split('.')
    .reduce(
      (acc, part) => acc && (acc as Record<string, unknown>)[part],
      obj as unknown,
    );
};

// Image/URL columns are meaningless in exported reports, so they are dropped
// for every module regardless of what the caller passes.
const IMAGE_KEY_PATTERN = /(image|logo|thumbnail|avatar|banner|photo)/i;

const withoutImageColumns = (columns: Column[]): Column[] =>
  columns.filter(
    (column) => !IMAGE_KEY_PATTERN.test(column.dataKey.split('.').pop() ?? ''),
  );

const PDF_MAX_CELL_LINES = 5;
const PDF_FONT_SIZE = 9;
const PDF_CELL_PADDING = 2.5;

// Wraps text to the cell width and caps it at PDF_MAX_CELL_LINES, ending the
// last visible line with an ellipsis when content is cut off.
const clampCellText = (
  doc: jsPDF,
  text: string,
  maxWidth: number,
): string[] => {
  const options = { fontSize: PDF_FONT_SIZE };
  const lines = doc.splitTextToSize(text, maxWidth, options) as string[];
  if (lines.length <= PDF_MAX_CELL_LINES) return lines;
  const visible = lines.slice(0, PDF_MAX_CELL_LINES);
  let last = visible[PDF_MAX_CELL_LINES - 1].trimEnd();
  const fits = (value: string) =>
    doc.getStringUnitWidth(`${value}...`) * PDF_FONT_SIZE /
      doc.internal.scaleFactor <=
    maxWidth;
  while (last.length && !fits(last)) last = last.slice(0, -1).trimEnd();
  visible[PDF_MAX_CELL_LINES - 1] = `${last}...`;
  return visible;
};

const normalizeCurrencySymbol = (value: string): string =>
  value.replace(/(^|\s)(?:CRC|¡)(?=\s|\d)/g, '$1₡');

const cellValue = (item: Record<string, unknown>, column: Column): string => {
  const value = column.formatter
    ? column.formatter(item)
    : resolveNestedKey(item, column.dataKey);
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'number' && !Number.isFinite(value))
  )
    return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return normalizeCurrencySymbol(String(value));
};

const drawColonSymbol = (
  doc: jsPDF,
  x: number,
  y: number,
  fontSize: number,
) => {
  const radius = fontSize * 0.12;
  const centerX = x + radius;
  const centerY = y - radius * 0.85;
  doc.setLineWidth(Math.max(0.15, fontSize * 0.025));
  doc.circle(centerX, centerY, radius, 'S');
  doc.setDrawColor(255, 255, 255);
  doc.line(
    centerX + radius * 0.45,
    centerY - radius,
    centerX + radius * 1.1,
    centerY + radius,
  );
  doc.setDrawColor(0, 0, 0);
  doc.line(
    x - radius * 0.15,
    centerY - radius * 0.25,
    x + radius * 1.75,
    centerY - radius * 0.25,
  );
  doc.line(
    x - radius * 0.15,
    centerY + radius * 0.25,
    x + radius * 1.75,
    centerY + radius * 0.25,
  );
};

export const downloadPdf = <T extends Record<string, unknown>>(
  fileName: string,
  columns: Column[],
  data: T[],
) => {
  columns = withoutImageColumns(columns);
  // Give each column room to remain legible even in wide reports.
  const pageWidth = Math.max(297, columns.length * 36 + 20);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pageWidth, 210],
  });
  const columnWidth = (pageWidth - 20) / columns.length;
  // Small tolerance so autoTable never re-wraps a pre-clamped line.
  const textWidth = columnWidth - PDF_CELL_PADDING * 2 - 0.5;
  const tableColumn = columns.map((col) => col.header);
  const tableRows: (string | number)[][] = [];

  data.forEach((item) => {
    const rowData = columns.map((col) => {
      return cellValue(item, col);
    });
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows as never,
    startY: 20,
    headStyles: {
      fillColor: [225, 230, 235],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
    },
    styles: {
      overflow: 'linebreak',
      fontSize: PDF_FONT_SIZE,
      cellPadding: PDF_CELL_PADDING,
      valign: 'top',
      minCellHeight: 8,
    },
    columnStyles: Object.fromEntries(
      columns.map((_, index) => [
        index,
        { cellWidth: columnWidth },
      ]),
    ),
    margin: { top: 10, left: 10, right: 10 },
    tableWidth: 'wrap',
    rowPageBreak: 'avoid',
    didParseCell: (hookData) => {
      if (hookData.section !== 'body') return;
      const text = hookData.cell.text.join('\n');
      if (!text.startsWith('₡')) {
        hookData.cell.text = clampCellText(doc, text, textWidth);
        return;
      }
      hookData.cell.text = clampCellText(
        doc,
        `    ${text.slice(1).trimStart()}`,
        textWidth,
      );
      (
        hookData.cell as typeof hookData.cell & { hasColonSymbol?: boolean }
      ).hasColonSymbol = true;
    },
    didDrawCell: (hookData) => {
      const cell = hookData.cell as typeof hookData.cell & {
        hasColonSymbol?: boolean;
      };
      if (!cell.hasColonSymbol) return;
      const fontSize = Number(cell.styles.fontSize) || 9;
      drawColonSymbol(
        doc,
        cell.x + cell.padding('left'),
        cell.y + cell.padding('top') + fontSize * 0.28,
        fontSize,
      );
    },
  });

  doc.save(`${fileName}.pdf`);
};

export const downloadExcel = <T extends Record<string, unknown>>(
  fileName: string,
  columns: Column[],
  data: T[],
) => {
  columns = withoutImageColumns(columns);
  const rows = data.map((item) =>
    columns.map((column) => cellValue(item, column)),
  );
  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map((column) => column.header),
    ...rows,
  ]);
  worksheet['!cols'] = columns.map((column, index) => ({
    wch: Math.max(
      16,
      Math.min(
        100,
        rows.reduce(
          (length, row) => Math.max(length, row[index].length),
          column.header.length,
        ) + 2,
      ),
    ),
  }));
  worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1' };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);
};

export const downloadCsv = <T extends Record<string, unknown>>(
  fileName: string,
  columns: Column[],
  data: T[],
) => {
  columns = withoutImageColumns(columns);
  const escapeCsvCell = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const rows = [
    columns.map((column) => column.header),
    ...data.map((item) => columns.map((column) => cellValue(item, column))),
  ];
  const content = rows
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], {
    type: 'text/csv;charset=utf-8',
  });
  saveAs(blob, `${fileName}.csv`);
};
