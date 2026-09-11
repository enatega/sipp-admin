'use client';

import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { RatingSelectFilter } from '@/components/shared/filters/RatingSelectFilter';
import { ShopTypeSelectFilter } from '@/components/shared/filters/ShopTypeSelectFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';

interface AdvanceFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvanceFiltersDialog({
  open,
  onClose,
}: AdvanceFiltersDialogProps) {
  const t = useTranslations('lumiFood.stores.filters');
  const { getParam, setParams } = useQueryParams();

  const currentShopType = getParam('shopType');
  const currentZone = getParam('zoneId');
  const currentRating = getParam('rating');

  const hasAdvanceFilters = currentShopType || currentZone || currentRating;

  const clearAdvanceFilters = () => {
    setParams({
      shopType: null,
      zoneId: null,
      rating: null,
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
          <div
            className={`flex mt-6  ${hasAdvanceFilters ? 'justify-between' : 'justify-end'} w-full`}
          >
            {hasAdvanceFilters && (
              <div>
                <AppButton
                  variant="secondary"
                  onClick={clearAdvanceFilters}
                  className="text-primary"
                >
                  <FilterX size={16} className="mr-2" />
                  {t('clearFilters')}
                </AppButton>
              </div>
            )}
            <div>
              <AppButton variant="primary" onClick={handleApplyFilters}>
                {t('applyFilters')}
              </AppButton>
            </div>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShopTypeSelectFilter
          paramKey="shopType"
          label={t('shopType')}
          placeholder={t('selectShopType')}
        />

        <ZoneSelectFilter
          paramKey="zoneId"
          label={t('zone')}
          placeholder={t('selectZone')}
        />

        <RatingSelectFilter
          paramKey="rating"
          label={t('rating')}
          placeholder={t('selectRating')}
        />
      </div>
    </AppDialog>
  );
}
