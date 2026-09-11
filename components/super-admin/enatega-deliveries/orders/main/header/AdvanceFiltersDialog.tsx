'use client';

import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { useGetSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { useQueryParams } from '@/hooks/use-query-params';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdvanceFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  hideStore?: boolean;
}

export default function AdvanceFiltersDialog({
  open,
  onClose,
  hideStore = false,
}: AdvanceFiltersDialogProps) {
  const t = useTranslations('orders.filters');
  const tAdvanced = useTranslations('orders.filters.advanced');
  const tFields = useTranslations('orders.filters.advanced.fields');
  const tPlaceholders = useTranslations('orders.filters.advanced.placeholders');
  const tCommon = useTranslations('common');
  const { getAllParams, setParams } = useQueryParams();
  const allParams = getAllParams() as Record<string, string>;

  const { order_type: currentOrderType, store: currentStore } = allParams;
  const currentStatus = allParams.status;

  const { data: storesData, isLoading: isStoresLoading } =
    useGetSimpleStores({ enabled: open && !hideStore });

  const orderTypeOptions = [
    { key: 'pickup', value: 'pickup' },
    { key: 'delivery', value: 'delivery' },
  ];
  const statusOptions = [
    { key: tAdvanced('orderStatusOptions.scheduled'), value: 'scheduled' },
    { key: tAdvanced('orderStatusOptions.accepted'), value: 'accepted' },
    { key: tAdvanced('orderStatusOptions.preparing'), value: 'preparing' },
    { key: tAdvanced('orderStatusOptions.ready'), value: 'ready' },
    { key: tAdvanced('orderStatusOptions.riderAssigned'), value: 'rider_assigned' },
    { key: tAdvanced('orderStatusOptions.pickedUp'), value: 'picked_up' },
    { key: tAdvanced('orderStatusOptions.outForDelivery'), value: 'out_for_delivery' },
    { key: tAdvanced('orderStatusOptions.arrived'), value: 'arrived' },
    { key: tAdvanced('orderStatusOptions.delivered'), value: 'delivered' },
    { key: tAdvanced('orderStatusOptions.rejected'), value: 'rejected' },
    { key: tAdvanced('orderStatusOptions.failed'), value: 'failed' },
    { key: tAdvanced('orderStatusOptions.pending'), value: 'pending' },
  ];

  const storeOptions = (storesData ?? [])
    .map((s) => {
      const storeName =
        s.storename ||
        (s as { storeName?: string }).storeName ||
        (s as { name?: string }).name ||
        '';

      return {
        key: storeName.trim(),
        value: s.id,
      };
    })
    .filter((s) => Boolean(s.key));

  const hasAdvanceFilters = currentOrderType || currentStatus || currentStore;
  const clearAdvanceFilters = () => {
    setParams({ order_type: null, status: null, store: null, page: '1' });
  };

  const handleApplyFilters = () => {
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={tAdvanced('title')}
      size="2xl"
      showDefaultFooter={false}
      footerClassName="pt-0 px-4"
      footer={
        <div className="w-full flex items-center justify-between">
          <div>
            {hasAdvanceFilters && (
              <AppButton
                variant="secondary"
                onClick={clearAdvanceFilters}
                className="text-primary/70"
              >
                <FilterX size={16} className="mr-2" />
                {t('clearFiltersButton')}
              </AppButton>
            )}
          </div>
          <AppButton variant="primary" onClick={handleApplyFilters}>
            {tAdvanced('applyFilters')}
          </AppButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppSelect
          name="order_type"
          label={tFields('orderType')}
          placeholder={
            tPlaceholders('orderType')
          }
          options={orderTypeOptions}
          value={currentOrderType?.toLowerCase() ?? undefined}
          onValueChange={(value) => {
            setParams({ order_type: value || null, page: '1' });
          }}
          disabled={false}
        />
        <AppSelect
          name="status"
          label={tFields('orderStatus')}
          placeholder={tPlaceholders('orderStatus')}
          options={statusOptions}
          value={currentStatus ?? undefined}
          onValueChange={(value) => {
            setParams({ status: value || null, page: '1' });
          }}
          disabled={false}
        />

        {!hideStore && (
          <AppSelect
            name="store"
            label={tFields('store')}
            placeholder={
              isStoresLoading ? tCommon('loading') : tPlaceholders('store')
            }
            options={storeOptions}
            value={currentStore ?? undefined}
            onValueChange={(value) => {
              setParams({ store: value || null, page: '1' });
            }}
            disabled={isStoresLoading}
            emptyText={tCommon('noDataFound')}
          />
        )}

      </div>
    </AppDialog>
  );
}
