'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';

type RegistrationMethod = 'google' | 'manual';
type UserStatus = 'active' | 'blocked';

export const Filters = () => {
  const t = useTranslations('users');
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

  const currentStartDate = getParam('fromDate');
  const currentEndDate = getParam('toDate');
  const currentRegistrationMethod = getParam('registrationMethod');
  const currentStatus = getParam('status');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      fromDate: null,
      toDate: null,
      registrationMethod: null,
      status: null,
      page: '1',
    });
  };

  const registrationMethodOptions = [
    { value: 'google', key: t('registrationMethods.google') },
    { value: 'manual', key: t('registrationMethods.manual') },
  ] as const;

  const statusOptions = [
    { value: 'active', key: t('statuses.active') },
    { value: 'blocked', key: t('statuses.blocked') },
  ] as const;

  const showClearButton =
    getParam('search') ||
    getParam('fromDate') ||
    getParam('toDate') ||
    getParam('registrationMethod') ||
    getParam('status');

  return (
    <div className="flex gap-2 flex-wrap items-center mb-4">
      <div className="w-full sm:w-[320px]">
        <SearchInput
          inputClassName="h-10 sm:h-11"
          placeholder={t('filters.searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      <DateRangePicker
        placeholder={t('filters.filterByDateRange')}
        className="shadow-sm w-full sm:w-auto"
        date={
          currentStartDate && currentEndDate
            ? { from: parseISO(currentStartDate), to: parseISO(currentEndDate) }
            : undefined
        }
        onDateChange={(range) => {
          setParams({
            fromDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            toDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
            page: '1',
          });
        }}
      />

      <MultiSelect
        options={registrationMethodOptions}
        selected={
          currentRegistrationMethod
            ? (currentRegistrationMethod as string)
                .split(',')
                .filter((m): m is RegistrationMethod => m === 'google' || m === 'manual')
            : []
        }
        onChange={(newMethods) => {
          const mappedMethods = newMethods.filter(
            (m): m is RegistrationMethod => m === 'google' || m === 'manual',
          );
          setParams({
            registrationMethod:
              mappedMethods.length > 0 ? mappedMethods.join(',') : null,
            page: '1',
          });
        }}
        placeholder={t('filters.filterByRegistration')}
        className="shadow-sm w-full sm:w-auto"
      />

      <MultiSelect
        options={statusOptions}
        selected={
          currentStatus
            ? (currentStatus as string)
                .split(',')
                .filter((s): s is UserStatus => s === 'active' || s === 'blocked')
            : []
        }
        onChange={(newStatuses) => {
          const mappedStatuses = newStatuses.filter(
            (s): s is UserStatus => s === 'active' || s === 'blocked',
          );

          setParams({
            status: mappedStatuses.length > 0 ? mappedStatuses.join(',') : null,
            page: '1',
          });
        }}
        placeholder={t('filters.filterByStatus')}
        className="shadow-sm w-full sm:w-auto"
      />

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70 w-full sm:w-auto"
        >
          <FilterX size={16} className="mr-2 !h-10 sm:!h-11" />
          {t('filters.clear')}
        </AppButton>
      )}
    </div>
  );
};
