'use client';

import * as React from 'react';
import { Upload, AlertTriangle, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useBulkUploadProducts } from '@/hooks/api/store/deliveries/product-management/products';
import { returnErrorMessage } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';

type CsvRow = Record<string, string>;

type CsvValidationError = {
  row: number;
  field: string;
  message: string;
};

type CsvPreviewState = {
  headers: string[];
  rows: CsvRow[];
  errors: CsvValidationError[];
};

const CSV_HEADERS = [
  'product_sku',
  'product_name',
  'category',
  'subcategory',
  'base_price',
  'product_stock_type',
  'product_stock_quantity',
  'unit_of_measure',
  'description',
  'product_image_url',
  'variation_name',
  'variation_price',
  'variation_stock_type',
  'variation_stock_quantity',
  'variation_image_url',
  'addon_group_name',
  'addon_required',
  'addon_selection_type',
  'addon_option_title',
  'addon_option_description',
  'addon_option_price',
  'addon_option_stock_type',
  'addon_option_stock_quantity',
] as const;

const REQUIRED_PRODUCT_FIELDS = [
  'product_sku',
  'product_name',
  'category',
  'base_price',
  'product_stock_type',
  'product_image_url',
] as const;

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const normalize = (value: string) => value.trim().toLowerCase();

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

const isValidHttpUrl = (value: string) => {
  if (!value) return false;
  return /^https?:\/\//i.test(value.trim());
};

const isFiniteNumber = (value: string) => {
  if (!value) return false;
  return Number.isFinite(Number(value));
};

const hasAnyValue = (row: CsvRow, keys: string[]) =>
  keys.some((key) => (row[key] ?? '').trim() !== '');

const buildCsvPreview = (rawCsv: string): CsvPreviewState => {
  const lines = rawCsv
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '');

  if (!lines.length) {
    return {
      headers: [],
      rows: [],
      errors: [{ row: 1, field: 'file', message: 'CSV file is empty' }],
    };
  }

  const headers = parseCsvLine(lines[0]);
  const errors: CsvValidationError[] = [];
  const expectedColumnCount = CSV_HEADERS.length;

  CSV_HEADERS.forEach((header) => {
    if (!headers.includes(header)) {
      errors.push({
        row: 1,
        field: header,
        message: `Missing required header: ${header}`,
      });
    }
  });

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: CsvRow = {};
    row.__columnCount = String(values.length);

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const rowColumnCount = Number(row.__columnCount ?? 0);

    if (rowColumnCount !== expectedColumnCount) {
      errors.push({
        row: rowNumber,
        field: 'CSV Row',
        message: `Column mismatch: expected ${expectedColumnCount}, got ${rowColumnCount}. Check missing/extra comma.`,
      });
      return;
    }

    const looksMisalignedAddon =
      ['yes', 'no'].includes(normalize(row.addon_group_name ?? '')) ||
      ['single', 'multiple'].includes(normalize(row.addon_required ?? '')) ||
      ['limited', 'unlimited'].includes(normalize(row.addon_option_price ?? '')) ||
      isFiniteNumber(row.addon_option_stock_type ?? '');

    if (looksMisalignedAddon) {
      errors.push({
        row: rowNumber,
        field: 'CSV Row',
        message:
          'Row appears misaligned from add-on columns. Check commas before addon_group_name.',
      });
      return;
    }

    REQUIRED_PRODUCT_FIELDS.forEach((field) => {
      if (!(row[field] ?? '').trim()) {
        errors.push({ row: rowNumber, field, message: `${field} is required` });
      }
    });

    if ((row.base_price ?? '').trim() && !isFiniteNumber(row.base_price)) {
      errors.push({
        row: rowNumber,
        field: 'base_price',
        message: 'base_price must be a valid number',
      });
    }

    const productStockType = normalize(row.product_stock_type ?? '');
    if (productStockType && !['limited', 'unlimited'].includes(productStockType)) {
      errors.push({
        row: rowNumber,
        field: 'product_stock_type',
        message: 'product_stock_type must be limited or unlimited',
      });
    }

    if (productStockType === 'limited') {
      if (!(row.product_stock_quantity ?? '').trim()) {
        errors.push({
          row: rowNumber,
          field: 'product_stock_quantity',
          message: 'product_stock_quantity is required for limited stock',
        });
      } else if (!isFiniteNumber(row.product_stock_quantity)) {
        errors.push({
          row: rowNumber,
          field: 'product_stock_quantity',
          message: 'product_stock_quantity must be a valid number',
        });
      }
    }

    if (productStockType === 'unlimited' && (row.product_stock_quantity ?? '').trim()) {
      errors.push({
        row: rowNumber,
        field: 'product_stock_quantity',
        message: 'product_stock_quantity must be empty for unlimited stock',
      });
    }

    if ((row.product_image_url ?? '').trim() && !isValidHttpUrl(row.product_image_url)) {
      errors.push({
        row: rowNumber,
        field: 'product_image_url',
        message: 'product_image_url must be a valid public URL',
      });
    }

    const variationFields = [
      'variation_name',
      'variation_price',
      'variation_stock_type',
      'variation_stock_quantity',
      'variation_image_url',
    ];

    const hasVariation = hasAnyValue(row, variationFields);

    if (hasVariation) {
      if (!(row.variation_name ?? '').trim()) {
        errors.push({
          row: rowNumber,
          field: 'variation_name',
          message: 'variation_name is required when variation data is provided',
        });
      }

      if (!(row.variation_price ?? '').trim()) {
        errors.push({
          row: rowNumber,
          field: 'variation_price',
          message: 'variation_price is required when variation exists',
        });
      } else if (!isFiniteNumber(row.variation_price)) {
        errors.push({
          row: rowNumber,
          field: 'variation_price',
          message: 'variation_price must be a valid number',
        });
      }

      const variationStockType = normalize(row.variation_stock_type ?? '');
      if (!variationStockType || !['limited', 'unlimited'].includes(variationStockType)) {
        errors.push({
          row: rowNumber,
          field: 'variation_stock_type',
          message: 'variation_stock_type must be limited or unlimited',
        });
      }

      if (variationStockType === 'limited') {
        if (!(row.variation_stock_quantity ?? '').trim()) {
          errors.push({
            row: rowNumber,
            field: 'variation_stock_quantity',
            message: 'variation_stock_quantity is required for limited variation stock',
          });
        } else if (!isFiniteNumber(row.variation_stock_quantity)) {
          errors.push({
            row: rowNumber,
            field: 'variation_stock_quantity',
            message: 'variation_stock_quantity must be a valid number',
          });
        }
      }

      if (variationStockType === 'unlimited' && (row.variation_stock_quantity ?? '').trim()) {
        errors.push({
          row: rowNumber,
          field: 'variation_stock_quantity',
          message: 'variation_stock_quantity must be empty for unlimited variation stock',
        });
      }

      if ((row.variation_image_url ?? '').trim() && !isValidHttpUrl(row.variation_image_url)) {
        errors.push({
          row: rowNumber,
          field: 'variation_image_url',
          message: 'variation_image_url must be a valid public URL',
        });
      }
    }

    const addonFields = [
      'addon_group_name',
      'addon_required',
      'addon_selection_type',
      'addon_option_title',
      'addon_option_description',
      'addon_option_price',
      'addon_option_stock_type',
      'addon_option_stock_quantity',
    ];

    const hasAddonData = hasAnyValue(row, addonFields);

    if (hasAddonData) {
      const requiredAddonFields = [
        'addon_group_name',
        'addon_required',
        'addon_selection_type',
        'addon_option_title',
        'addon_option_price',
        'addon_option_stock_type',
      ];

      requiredAddonFields.forEach((field) => {
        if (!(row[field] ?? '').trim()) {
          errors.push({
            row: rowNumber,
            field,
            message: `${field} is required when add-on data is provided`,
          });
        }
      });

      const addonRequired = normalize(row.addon_required ?? '');
      if (addonRequired && !['yes', 'no'].includes(addonRequired)) {
        errors.push({
          row: rowNumber,
          field: 'addon_required',
          message: 'addon_required must be yes or no',
        });
      }

      const addonSelectionType = normalize(row.addon_selection_type ?? '');
      if (addonSelectionType && !['single', 'multiple'].includes(addonSelectionType)) {
        errors.push({
          row: rowNumber,
          field: 'addon_selection_type',
          message: 'addon_selection_type must be single or multiple',
        });
      }

      if ((row.addon_option_price ?? '').trim() && !isFiniteNumber(row.addon_option_price)) {
        errors.push({
          row: rowNumber,
          field: 'addon_option_price',
          message: 'addon_option_price must be a valid number',
        });
      }

      const optionStockType = normalize(row.addon_option_stock_type ?? '');
      if (optionStockType && !['limited', 'unlimited'].includes(optionStockType)) {
        errors.push({
          row: rowNumber,
          field: 'addon_option_stock_type',
          message: 'addon_option_stock_type must be limited or unlimited',
        });
      }

      if (optionStockType === 'limited') {
        if (!(row.addon_option_stock_quantity ?? '').trim()) {
          errors.push({
            row: rowNumber,
            field: 'addon_option_stock_quantity',
            message: 'addon_option_stock_quantity is required for limited add-on stock',
          });
        } else if (!isFiniteNumber(row.addon_option_stock_quantity)) {
          errors.push({
            row: rowNumber,
            field: 'addon_option_stock_quantity',
            message: 'addon_option_stock_quantity must be a valid number',
          });
        }
      }

      if (optionStockType === 'unlimited' && (row.addon_option_stock_quantity ?? '').trim()) {
        errors.push({
          row: rowNumber,
          field: 'addon_option_stock_quantity',
          message: 'addon_option_stock_quantity must be empty for unlimited add-on stock',
        });
      }
    }
  });

  return { headers, rows, errors };
};

interface BulkProductUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId?: string;
}

export function BulkProductUploadDialog({
  open,
  onOpenChange,
  storeId,
}: BulkProductUploadDialogProps) {
  const t = useTranslations('products.bulkUpload');
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<CsvPreviewState | null>(null);

  const { mutate: uploadBulkProducts, isPending } = useBulkUploadProducts({
    onSuccess: (response) => {
      toast.success(response.message || t('success.uploadStarted'));
      onOpenChange(false);
      setFile(null);
      setPreview(null);
    },
    onError: (error) => {
      toast.error(returnErrorMessage(error as ApiErrorResponse) || t('errors.uploadFailed'));
    },
  });

  const hasErrors = (preview?.errors.length ?? 0) > 0;

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);
    setPreview(null);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error(t('errors.fileTooLarge'));
      return;
    }

    const content = await selectedFile.text();
    const parsed = buildCsvPreview(content);
    setPreview(parsed);
  };

  const handleUpload = () => {
    if (!storeId) {
      toast.error(t('errors.storeIdRequired'));
      return;
    }

    if (!file) {
      toast.error(t('errors.fileRequired'));
      return;
    }

    if (!preview) {
      toast.error(t('errors.previewRequired'));
      return;
    }

    if (hasErrors) {
      toast.error(t('errors.fixErrorsBeforeUpload'));
      return;
    }

    uploadBulkProducts({
      file,
      store_id: storeId,
      importMode: 'create',
      autoCreateMasterData: true,
    });
  };

  const previewRows = preview?.rows.slice(0, 10) ?? [];

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={t('title')}
      size="6xl"
      showDefaultFooter={false}
      footer={(
        <div className="flex w-full justify-end gap-3">
          <AppButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            {t('buttons.cancel')}
          </AppButton>
          <AppButton
            type="button"
            leftIcon={<Upload size={16} />}
            onClick={handleUpload}
            isLoading={isPending}
            disabled={!file || !preview || hasErrors || isPending}
          >
            {t('buttons.upload')}
          </AppButton>
        </div>
      )}
    >
      <div className="space-y-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              htmlFor="bulk-upload-csv"
              className="inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
            >
              <FileText size={16} className="mr-2" />
              {t('buttons.chooseFile')}
            </label>
            <input
              id="bulk-upload-csv"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                handleFileChange(selectedFile);
              }}
            />
            <span className="text-sm text-muted-foreground">
              {file?.name || t('noFileSelected')}
            </span>
          </div>
        </div>

        {preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">{t('summary.totalRows')}</p>
                <p className="text-lg font-semibold">{preview.rows.length}</p>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">{t('summary.validRows')}</p>
                <p className="text-lg font-semibold">
                  {Math.max(preview.rows.length - preview.errors.length, 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">{t('summary.errors')}</p>
                <p className="text-lg font-semibold text-destructive">{preview.errors.length}</p>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-destructive">
                  <AlertTriangle size={16} />
                  <p className="text-sm font-semibold">{t('errors.validationTitle')}</p>
                </div>
                <div className="max-h-44 overflow-auto rounded-md border bg-white">
                  <table className="min-w-full text-sm">
                      <thead className="bg-accent/60 text-left">
                        <tr>
                          <th className="whitespace-nowrap px-3 py-2">{t('errors.columns.row')}</th>
                          <th className="whitespace-nowrap px-3 py-2">{t('errors.columns.field')}</th>
                          <th className="whitespace-nowrap px-3 py-2">{t('errors.columns.message')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.errors.slice(0, 100).map((errorItem, index) => (
                          <tr key={`${errorItem.row}-${errorItem.field}-${index}`} className="border-t">
                            <td className="whitespace-nowrap px-3 py-2">{errorItem.row}</td>
                            <td className="whitespace-nowrap px-3 py-2 font-medium">{errorItem.field}</td>
                            <td className="whitespace-nowrap px-3 py-2">{errorItem.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-white p-4">
              <p className="mb-2 text-sm font-semibold">{t('preview.title')}</p>
              <p className="mb-3 text-xs text-muted-foreground">{t('preview.subtitle')}</p>
              <div className="max-h-64 overflow-auto rounded-md border bg-white">
                  <table className="min-w-max text-sm">
                    <thead className="bg-accent/60 text-left">
                      <tr>
                        {CSV_HEADERS.map((header) => (
                          <th key={header} className="whitespace-nowrap px-3 py-2">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, rowIndex) => (
                        <tr key={`preview-row-${rowIndex}`} className="border-t">
                          {CSV_HEADERS.map((header) => (
                            <td
                              key={`${rowIndex}-${header}`}
                              className="whitespace-nowrap px-3 py-2 align-top"
                            >
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
