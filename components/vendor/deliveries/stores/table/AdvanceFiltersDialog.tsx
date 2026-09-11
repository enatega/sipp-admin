'use client';

import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ShopTypeSelectFilter } from '@/components/shared/filters/ShopTypeSelectFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface AdvanceFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvanceFiltersDialog({
  open,
  onClose,
}: AdvanceFiltersDialogProps) {
  const t = useTranslations('vendorDeliveriesStores.filters');
  const tRatingOptions = useTranslations(
    'vendorDeliveriesStores.filters.ratingOptions',
  );
  const ratingOptions = [
    { key: tRatingOptions('fiveStars'), value: '5' },
    { key: tRatingOptions('fourPlusStars'), value: '4' },
    { key: tRatingOptions('threePlusStars'), value: '3' },
    { key: tRatingOptions('twoPlusStars'), value: '2' },
    { key: tRatingOptions('onePlusStars'), value: '1' },
  ];
  const { getParam, setParams } = useQueryParams();

  const currentShopTypeId = getParam('shopTypeId');
  const currentZoneId = getParam('zoneId');
  const currentRating = getParam('minRating');

  const hasAdvanceFilters = currentShopTypeId || currentZoneId || currentRating;

  const clearAdvanceFilters = () => {
    setParams({
      shopTypeId: null,
      zoneId: null,
      minRating: null,
      page: '1',
    });
  };

  const handleApplyFilters = () => {
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('advanceFilters')}
      size="2xl"
      showDefaultFooter={false}
      footer={
        <>
          {hasAdvanceFilters && (
            <AppButton
              variant="secondary"
              onClick={clearAdvanceFilters}
              className="text-primary/70"
            >
              <FilterX size={16} className="mr-2" />
              {t('clearFilters')}
            </AppButton>
          )}
          <AppButton
            variant="primary"
            onClick={handleApplyFilters}
            className="ml-auto"
          >
            {t('applyFilters')}
          </AppButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShopTypeSelectFilter
          paramKey="shopTypeId"
          label={t('shopType')}
          placeholder={t('selectShopType')}
        />

        <ZoneSelectFilter
          paramKey="zoneId"
          label={t('zone')}
          placeholder={t('selectZone')}
        />

        <AppSelect
          name="minRating"
          label={t('rating')}
          placeholder={t('selectRating')}
          options={ratingOptions}
          value={currentRating || ''}
          onValueChange={(value) => {
            setParams({ minRating: value || null, page: '1' });
          }}
        />
      </div>
    </AppDialog>
  );
}
