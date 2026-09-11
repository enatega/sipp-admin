'use client';

import { useTranslations } from 'next-intl';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { StatusSelectFilter } from '@/components/shared/filters/StatusSelectFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface AdvanceFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvanceFiltersDialog({
  open,
  onClose,
}: AdvanceFiltersDialogProps) {
  const t = useTranslations('vendorEarnings.table.filters');
  const tStatuses = useTranslations('vendorEarnings.table.statuses');
  const {
    data: storesData,
    isLoading,
    isError,
  } = useGetAllSimpleStores({
    refetchOnWindowFocus: false,
  });
  const statusOptions = [
    { key: tStatuses('completed'), value: 'completed' },
    { key: tStatuses('cancelled'), value: 'cancelled' },
    { key: tStatuses('pending'), value: 'pending' },
  ];
  const { getParam, setParams } = useQueryParams();
  const StoreOptions = storesData?.map((store) => ({
    key: store.storename,
    value: store.id,
  }));
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
          <div className="flex mt-6 justify-between w-full">
            <div>
              <ClearFiltersButton paramKeys={['zoneId', 'status', 'storeId']} />
            </div>
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
        <ZoneSelectFilter
          paramKey="zoneId"
          label={t('zoneLabel')}
          placeholder={t('selectZonePlaceholder')}
        />
        <StatusSelectFilter
          paramKey="status"
          label={t('statusLabel')}
          placeholder={t('selectStatusPlaceholder')}
          options={statusOptions}
        />

        <AppSelect
          name={'storeId'}
          label={t('storeLabel')}
          placeholder={t('storePlaceholder')}
          options={StoreOptions}
          value={getParam('storeId') || ''}
          onValueChange={(value) => {
            setParams({ ['storeId']: value || null, page: '1' });
          }}
          containerClassName="min-w-[150px]"
          className="rounded-[6px]"
          loading={isLoading}
          error={isError ? t('storesFetchFailed') : ''}
        />
      </div>
    </AppDialog>
  );
}
