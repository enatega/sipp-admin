'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { downloadExcel, downloadPdf } from '@/lib/download';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { AppButton } from './AppButton';

interface Column<T> {
  header: string;
  dataKey: string;
  formatter?: (item: T) => string;
}

interface DownloadButtonsProps<T> {
  fileName: string;
  data: T[];
  columns: Column<T>[];
  className?: string;
  fetchAll?: () => Promise<T[]>;
}

export function DownloadButtons<T extends object>({
  fileName,
  data,
  columns,
  className,
  fetchAll,
}: DownloadButtonsProps<T>) {
  const t = useTranslations('common');
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);
  const inProgress = useRef(false);

  const handleDownload = async (format: 'pdf' | 'excel') => {
    if (inProgress.current) return;
    inProgress.current = true;
    setDownloading(format);
    try {
      const rows = fetchAll ? await fetchAll() : data;
      const normalizedRows = rows as unknown as Record<string, unknown>[];
      if (format === 'pdf') {
        downloadPdf(fileName, columns as never, normalizedRows);
        toast.success(t('pdfDownloadSuccess'));
      } else {
        downloadExcel(fileName, columns as never, normalizedRows);
        toast.success(t('excelDownloadSuccess'));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not download report',
      );
    } finally {
      inProgress.current = false;
      setDownloading(null);
    }
  };

  return (
    <div
      className={cn('flex flex-wrap gap-2 items-end justify-start ', className)}
    >
      <AppButton
        variant="mute"
        disabled={downloading !== null || (!fetchAll && !data.length)}
        isLoading={downloading === 'pdf'}
        leftIcon={
          <Image
            src={toAbsoluteUrl('/svgs/pdf.svg')}
            width={20}
            height={20}
            alt={t('downloadPdf')}
            className=""
          />
        }
        onClick={() => void handleDownload('pdf')}
      >
        <span>{t('downloadPdf')}</span>
      </AppButton>
      <AppButton
        variant="mute"
        disabled={downloading !== null || (!fetchAll && !data.length)}
        isLoading={downloading === 'excel'}
        leftIcon={
          <Image
            src={toAbsoluteUrl('/images/excel.png')}
            width={20}
            height={20}
            alt={t('downloadExcel')}
            className=""
          />
        }
        onClick={() => void handleDownload('excel')}
      >
        <span>{t('downloadExcel')}</span>
      </AppButton>
    </div>
  );
}
