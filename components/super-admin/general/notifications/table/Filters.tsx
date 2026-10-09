'use client';

import { useEffect, useState } from 'react';
import { SortByField, SortOrder, UserType } from '@/types';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppButton } from '@/components/shared/AppButton';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';

const userTypeOptions = [
  'All',
  'Rider',
  'Customer',
  'Store',
  'Admin',
  'Staff',
  'Vendor',
];

const userTypeMapping: { [key: string]: UserType } = {
  All: 'all',
  Rider: 'rider',
  Customer: 'customer',
  Store: 'store',
  Admin: 'admin',
  Staff: 'staff',
  Vendor: 'vendor',
};

export const reverseUserTypeMapping: { [key in UserType]: string } = {
  all: 'All',
  rider: 'Rider',
  customer: 'Customer',
  store: 'Store',
  admin: 'Admin',
  staff: 'Staff',
  vendor: 'Vendor',
};

const Filters = () => {
  const t = useTranslations('notifications.filters');
  const { getParam, setParams } = useQueryParams();

  const sortOptions: {
    label: string;
    value: string;
    sortBy: SortByField;
    sortOrder: SortOrder;
  }[] = [
    { label: t('sortMostRecent'), value: 'created_at:DESC', sortBy: 'created_at', sortOrder: 'DESC' },
    { label: t('sortOldest'), value: 'created_at:ASC', sortBy: 'created_at', sortOrder: 'ASC' },
    { label: t('sortTitleAZ'), value: 'title:ASC', sortBy: 'title', sortOrder: 'ASC' },
    { label: t('sortTitleZA'), value: 'title:DESC', sortBy: 'title', sortOrder: 'DESC' },
    { label: t('sortTypeAZ'), value: 'type:ASC', sortBy: 'type', sortOrder: 'ASC' },
    { label: t('sortTypeZA'), value: 'type:DESC', sortBy: 'type', sortOrder: 'DESC' },
  ];

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
  const currentSentTo = getParam('sentTo');
  const currentSortBy = getParam('sortBy') as SortByField;
  const currentSortOrder = getParam('sortOrder') as SortOrder;

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      sentTo: null,
      sortBy: null,
      sortOrder: null,
      page: '1',
    });
  };

  const showClearButton =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    getParam('sentTo') ||
    getParam('sortBy') ||
    getParam('sortOrder');

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-full sm:w-[320px]">
        <SearchInput
          inputClassName="h-10 sm:h-11"
          placeholder={t('searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      <DateRangePicker
        placeholder={t('dateRangePlaceholder')}
        className="shadow-sm w-full sm:w-auto"
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
        options={userTypeOptions}
        selected={
          currentSentTo
            ? (currentSentTo as string)
                .split(',')
                .map((type) => reverseUserTypeMapping[type as UserType])
                .filter(Boolean)
            : []
        }
        onChange={(newTypes) => {
          const mappedTypes = newTypes
            .map((type) => userTypeMapping[type])
            .filter(Boolean);
          setParams({
            sentTo: mappedTypes.length > 0 ? mappedTypes.join(',') : null,
            page: '1',
          });
        }}
        placeholder={t('recipientPlaceholder')}
        className="shadow-sm w-full sm:w-auto"
      />

      <Select
        value={`${currentSortBy || 'created_at'}:${currentSortOrder || 'DESC'}`}
        onValueChange={(value) => {
          const selectedSort = sortOptions.find((option) => option.value === value);
          if (!selectedSort) return;
          setParams({
            sortBy: selectedSort.sortBy,
            sortOrder: selectedSort.sortOrder,
            page: '1',
          });
        }}
      >
        <SelectTrigger aria-label={t('sortLabel')} className="w-full sm:w-[210px] !h-11 sm:!h-11 shadow-sm">
          <SelectValue placeholder={t('sortLabel')} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70 w-full sm:w-auto"
        >
          <FilterX size={16} className="mr-2 !h-10 sm:!h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
