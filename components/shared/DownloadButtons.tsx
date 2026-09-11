'use client';

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
}

export function DownloadButtons<T extends object>({
  fileName,
  data,
  columns,
  className,
}: DownloadButtonsProps<T>) {
  const t = useTranslations('common');
  const normalizedData = data as unknown as Record<string, unknown>[];

  const handleDownloadPdf = () => {
    downloadPdf(fileName, columns as never, normalizedData);
    toast.success(t('pdfDownloadSuccess'));
  };

  const handleDownloadExcel = () => {
    downloadExcel(fileName, columns as never, normalizedData);
    toast.success(t('excelDownloadSuccess'));
  };

  return (
    <div
      className={cn('flex flex-wrap gap-2 items-end justify-start ', className)}
    >
      <AppButton
        variant="mute"
        disabled={!data.length}
        leftIcon={
          <Image
            src={toAbsoluteUrl('/svgs/pdf.svg')}
            width={20}
            height={20}
            alt={t('downloadPdf')}
            className=""
          />
        }
        onClick={handleDownloadPdf}
      >
        <span>{t('downloadPdf')}</span>
      </AppButton>
      <AppButton
        variant="mute"
        disabled={!data.length}
        leftIcon={
          <Image
            src={toAbsoluteUrl('/images/excel.png')}
            width={20}
            height={20}
            alt={t('downloadExcel')}
            className=""
          />
        }
        onClick={handleDownloadExcel}
      >
        <span>{t('downloadExcel')}</span>
      </AppButton>
    </div>
  );
}
