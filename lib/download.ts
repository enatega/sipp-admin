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
  // Give each column room to remain legible even in wide reports.
  const pageWidth = Math.max(297, columns.length * 36 + 20);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pageWidth, 210],
  });
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
      fontSize: 9,
      cellPadding: 2.5,
      valign: 'top',
      minCellHeight: 8,
    },
    columnStyles: Object.fromEntries(
      columns.map((_, index) => [
        index,
        { cellWidth: (pageWidth - 20) / columns.length },
      ]),
    ),
    margin: { top: 10, left: 10, right: 10 },
    tableWidth: 'wrap',
    rowPageBreak: 'avoid',
    didParseCell: (hookData) => {
      if (hookData.section !== 'body') return;
      const text = hookData.cell.text.join(' ');
      if (!text.startsWith('₡')) return;
      hookData.cell.text = [`    ${text.slice(1).trimStart()}`];
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
