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

const resolveNestedKey = (obj: Record<string, unknown>, key: string): unknown => {
  return key.split('.').reduce((acc, part) => acc && (acc as Record<string, unknown>)[part], obj as unknown);
};

export const downloadPdf = <T extends Record<string, unknown>>(
  fileName: string,
  columns: Column[],
  data: T[],
) => {
  const doc = new jsPDF();
  const tableColumn = columns.map((col) => col.header);
  const tableRows: (string | number)[][] = [];

  data.forEach((item) => {
    const rowData = columns.map((col) => {
      const value = col.formatter ? col.formatter(item) : resolveNestedKey(item, col.dataKey);
      return value != null ? String(value) : '';
    });
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows as never,
    startY: 20,
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
    styles: { overflow: 'linebreak' },
    margin: { top: 10 },
  });

  doc.save(`${fileName}.pdf`);
};

export const downloadExcel = <T extends Record<string, unknown>>(
  fileName: string,
  columns: Column[],
  data: T[],
) => {
  const excelData = data.map((item) => {
    const row: Record<string, unknown> = {};
    columns.forEach((col) => {
      row[col.header] = col.formatter
        ? col.formatter(item)
        : resolveNestedKey(item, col.dataKey);
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  if (excelData.length > 0) {
    const colWidths = columns.map((col) => {
      const maxLength = Math.max(
        col.header.length,
        ...excelData.map((row) => {
          const value = row[col.header];
          return value ? String(value).length : 0;
        }),
      );
      return { wch: maxLength + 2 };
    });
    worksheet['!cols'] = colWidths;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);
};
