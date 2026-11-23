'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import { AppButton } from '@/components/shared/AppButton';
import type { ApiErrorResponse } from '@/types';

interface Props {
  storeId: string;
}

type BulkExportResponse = { fileName: string; csv: string; products: number };

/**
 * Downloads every product of the store in the bulk upload template format (categories, prices,
 * stock, SKUs, images, tax, nutrition, allergens, variations, add-ons), so the file can be uploaded
 * into another store with Bulk upload as it is.
 */
export function BulkExportButton({ storeId }: Props) {
  const t = useTranslations('products.bulkExport');
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async () => {
    setIsDownloading(true);
    try {
      const { data } = await Axios.get<BulkExportResponse>(
        `/apps/deliveries/products/store/${storeId}/bulk-export`,
      );
      const url = URL.createObjectURL(new Blob([data.csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(t('success', { count: data.products }));
    } catch (error) {
      const message = (error as ApiErrorResponse)?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || t('error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AppButton
      variant="mute"
      onClick={() => void download()}
      disabled={isDownloading}
      isLoading={isDownloading}
      title={t('hint')}
      leftIcon={<FileDown className="h-5 w-5 text-primary" aria-hidden="true" />}
    >
      <span>{isDownloading ? t('downloading') : t('button')}</span>
    </AppButton>
  );
}
