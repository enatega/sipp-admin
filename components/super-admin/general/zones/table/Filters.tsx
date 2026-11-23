'use client';

import { useEffect, useState } from 'react';
import { ZoneType } from '@/types';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';

const typeMapping: { [key: string]: ZoneType } = {
  'LO Foods': 'food',
  'LO Drive': 'drive',
  'LO Hotels': 'hotel',
  'LO Tickets': 'ticket',
};

export const reverseTypeMapping: { [key in ZoneType]: string } = {
  food: 'LO Foods',
  drive: 'LO Drive',
  hotel: 'LO Hotels',
  ticket: 'LO Tickets',
};

const Filters = () => {
  const t = useTranslations('zones.filters');
  const { getParam, setParams } = useQueryParams();

  // Local state for search input
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setParams, getParam]);

  const currentStartDate = getParam('startDate');
  const currentEndDate = getParam('endDate');
  const currentZoneType = getParam('zoneType');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      zoneType: null,
      page: '1',
    });
  };

  const typeOptions = ['LO Foods', 'LO Drive', 'LO Hotels', 'LO Tickets'];

  const showClearButton =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    getParam('zoneType');

  return (
    <div className="flex  gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchInput
          inputClassName="h-11"
          placeholder={t('searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      <DateRangePicker
        placeholder={t('filterByDateRange')}
        className="shadow-sm "
        date={
          currentStartDate && currentEndDate
            ? { from: parseISO(currentStartDate), to: parseISO(currentEndDate) }
            : undefined
        }
        onDateChange={(range) => {
          setParams({
            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
            page: '1',
          });
        }}
      />

      <MultiSelect
        options={typeOptions}
        selected={
          currentZoneType
            ? (currentZoneType as string)
                .split(',')
                .map((type) => reverseTypeMapping[type as ZoneType])
                .filter(Boolean)
            : []
        }
        onChange={(newTypes) => {
          const mappedTypes = newTypes
            .map((type) => typeMapping[type])
            .filter(Boolean);
          setParams({
            zoneType: mappedTypes.length > 0 ? mappedTypes.join(',') : null,
            page: '1',
          });
        }}
        placeholder={t('filterByType')}
        className="shadow-sm"
      />

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70"
        >
          <FilterX size={16} className="mr-2 !h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
