import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Column {
  header: string;
  dataKey: string;
  // Optional: A formatter function if the data needs special handling
  formatter?: (item: Record<string, unknown>) => string;
  // Optional: Excel writes this as a number cell with the given number format,
  // so amounts stay summable instead of becoming text.
  excel?: {
    value: (item: Record<string, unknown>) => number | null | undefined;
    numberFormat: string;
  };
}

// Excel number formats that keep cells numeric. The trailing `* ` repeats a
// space to fill the cell, which left-aligns the value like the text columns.
export const EXCEL_COUNT_FORMAT = '#,##0* ';

// `[$₡]` is Excel's currency-symbol token. Spreadsheet apps recognise it as a
// currency format more reliably than a quoted text literal like `"₡"`.
export const excelCurrencyFormat = (currencySymbol: string) =>
  `[$${currencySymbol.replace(/[[\]"]/g, '')}] #,##0.00* `;

export const toExcelNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

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

export const PDF_FONT = 'NotoSans';

// The built-in PDF fonts use WinAnsi encoding, which has no colón sign, so body
// cells are set in an embedded Unicode font. Loaded lazily to keep it out of
// the page bundle.
export const registerPdfFont = async (doc: jsPDF) => {
  const { NOTO_SANS_REGULAR_BASE64 } = await import('./fonts/noto-sans-regular');
  doc.addFileToVFS('NotoSans-Regular.ttf', NOTO_SANS_REGULAR_BASE64);
  doc.addFont('NotoSans-Regular.ttf', PDF_FONT, 'normal');
  doc.setFont(PDF_FONT, 'normal');
};

export const downloadPdf = async <T extends Record<string, unknown>>(
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
  await registerPdfFont(doc);
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
      font: 'helvetica',
      fontStyle: 'bold',
    },
    styles: {
      font: PDF_FONT,
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
      hookData.cell.text = clampCellText(
        doc,
        hookData.cell.text.join('\n'),
        textWidth,
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
  const cells = data.map((item, rowIndex) =>
    columns.map((column, columnIndex) => {
      const value = column.excel?.value(item);
      return value === null || value === undefined || !Number.isFinite(value)
        ? rows[rowIndex][columnIndex]
        : value;
    }),
  );
  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map((column) => column.header),
    ...cells,
  ]);
  columns.forEach((column, columnIndex) => {
    if (!column.excel) return;
    cells.forEach((row, rowIndex) => {
      if (typeof row[columnIndex] !== 'number') return;
      const address = XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex });
      worksheet[address].z = column.excel!.numberFormat;
    });
  });
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
  // Excel limits worksheet titles to 31 characters; the download filename
  // can carry the full filter context and timestamp independently.
  const sheetName = fileName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 31) || 'Report';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
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
