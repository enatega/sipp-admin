'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { SearchInput } from '@/components/shared/SearchInput';

interface IAddonsHeaderProps {
  onAddNew?: () => void;
}

export function AddonsHeader({ onAddNew }: IAddonsHeaderProps) {
  const t = useTranslations('storeAddons');
  const { getParam, setParams } = useQueryParams();
  const [searchTerm, setSearchTerm] = useState<string>(getParam('search') || '');

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 400);

    return () => {
      window.clearTimeout(handler);
    };
  }, [getParam, searchTerm, setParams]);

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Heading title={t('title')} />
          {onAddNew && (
            <AppButton onClick={onAddNew} className="gap-2">
              <Plus size={16} className="mr-2" />
              {t('addButton')}
            </AppButton>
          )}
        </div>

        <div className="flex w-full items-center">
          <div className="w-full sm:w-[340px]">
            <SearchInput
              placeholder={t('searchPlaceholder')}
              inputClassName="h-11"
              text={searchTerm}
              onChangeText={(text) => setSearchTerm(text)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
