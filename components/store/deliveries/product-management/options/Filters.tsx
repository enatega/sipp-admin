'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Option as StoreOption } from '@/types';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { SearchInput } from '@/components/shared/SearchInput';
import { useQueryParams } from '@/hooks/use-query-params';
import { useParams } from 'next/navigation';
import { fetchAllReport } from '@/lib/fetch-all-report';

interface FiltersProps {
  data: StoreOption[];
  columns: {
    header: string;
    dataKey: string;
    formatter?: (item: StoreOption) => string;
  }[];
}

export default function Filters({ data, columns }: FiltersProps) {
  const t = useTranslations('storeOptions');
  const { storeId } = useParams() as { storeId: string };
  const { getParam, setParams } = useQueryParams();
  const [searchTerm, setSearchTerm] = useState<string>(
    getParam('search') || '',
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, setParams, getParam]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="w-full sm:w-[340px]">
        <SearchInput
          inputClassName="h-10"
          placeholder={t('filters.searchPlaceholder')}
          text={searchTerm}
          onChangeText={setSearchTerm}
        />
      </div>
      <DownloadButtons<StoreOption>
        fileName="options"
        data={data}
        columns={columns as never}
        fetchAll={() => fetchAllReport<StoreOption>('/apps/deliveries/products/options', { params: { store_id: storeId } })}
        className="mb-0"
      />
    </div>
  );
}
