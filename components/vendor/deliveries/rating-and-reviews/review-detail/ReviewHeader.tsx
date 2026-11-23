'use client';

import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { RatingSelectFilter } from '@/components/shared/filters/RatingSelectFilter';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { Heading } from '@/components/shared/Heading';

const ReviewHeader = () => {
  const t = useTranslations('vendorRatingReviews.detail.header');
  const { getParam, setParams } = useQueryParams();
  const params = useParams();
  const routeStoreId = params?.id;
  const storeId = Array.isArray(routeStoreId) ? routeStoreId[0] : routeStoreId;
  const storeName = getParam('store_name');

  const currentStartDate = getParam('start_date');
  const currentEndDate = getParam('end_date');
  const showClearButton =
    getParam('start_date') || getParam('end_date') || getParam('star_ratings');

  const clearFilters = () => {
    setParams({
      start_date: null,
      end_date: null,
      star_ratings: null,
      rating: null,
      page: '1',
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Heading
        title={
          storeName
            ? t('titleWithStoreName', { store: storeName })
            : storeId
              ? t('titleWithStoreId', { storeId })
              : t('title')
        }
        showBackBtn
      />
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker
          placeholder={t('datePlaceholder')}
          className="shadow-sm min-w-[150px]"
          date={
            currentStartDate && currentEndDate
              ? {
                  from: parseISO(currentStartDate),
                  to: parseISO(currentEndDate),
                }
              : undefined
          }
          onDateChange={(range) => {
            setParams({
              start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
              end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
              page: '1',
            });
          }}
        />
        <div className="w-full sm:w-[220px]">
          <RatingSelectFilter
            paramKey="star_ratings"
            placeholder={t('ratingPlaceholder')}
            mode="threshold"
          />
        </div>

        {showClearButton && (
          <AppButton
            variant="secondary"
            onClick={clearFilters}
            className="text-primary/70"
          >
            <FilterX size={16} className="mr-2 !h-10 sm:!h-11" />
            {t('clear')}
          </AppButton>
        )}
      </div>
    </div>
  );
};

export default ReviewHeader;
