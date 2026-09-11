'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
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
  const t = useTranslations('withdrawalRequests.filters');
  const { getParam, setParams } = useQueryParams();

  const statusOptions = useMemo(
    () => [
      { key: t('statusOptionApproved'), value: 'approved' },
      { key: t('statusOptionPending'), value: 'pending' },
      { key: t('statusOptionRejected'), value: 'rejected' },
      { key: t('statusOptionTransfered'), value: 'transfered' },
      { key: t('statusOptionRequested'), value: 'requested' },
      { key: t('statusOptionCancelled'), value: 'canceled' },
    ],
    [t],
  );

  const paymentMethodOptions = useMemo(
    () => [
      { key: 'COD', value: 'COD' },
      { key: t('paymentMethodOptionCard'), value: 'card' },
      { key: t('paymentMethodOptionWallet'), value: 'wallet' },
    ],
    [t],
  );

  const currentWithdrawalType = getParam('status');
  const currentShopType = getParam('shopType');
  const currentStoreType = getParam('storeType');
  const currentVendorId = getParam('vendorId');
  const currentZoneId = getParam('zoneId');
  const currentStatus = getParam('requestStatus');
  const currentPaymentMethod = getParam('paymentMethod');
  const currentRider = getParam('riderId');

  const hasAdvanceFilters =
    currentShopType ||
    currentStoreType ||
    currentVendorId ||
    currentZoneId ||
    currentStatus ||
    currentPaymentMethod ||
    currentRider;

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
            <ClearFiltersButton
              paramKeys={[
                'startDate',
                'endDate',
                'search',
                'requestStatus',
                'vendorId',
                'storeType',
                'shopType',
                'paymentMethod',
                'zoneId',
              ]}
            />
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
        {/* withdrawalType removed per request */}

        <AppSelect
          key={currentStatus || 'empty-status'}
          name="status"
          label={t('status')}
          placeholder={t('selectStatus')}
          options={statusOptions}
          value={currentStatus || ''}
          onValueChange={(value) => {
            setParams({ requestStatus: value || null, page: '1' });
          }}
        />

        {currentWithdrawalType === 'rider_withdrawals' && (
          <ZoneSelectFilter label={t('zoneCity')} paramKey="zoneId" />
        )}
        {/* 
        {currentWithdrawalType === 'store_withdrawals' && (
          <ShopTypeSelectFilter label={t('shopType')} paramKey="shopType" />
        )} */}

        <AppSelect
          key={currentPaymentMethod || 'empty'}
          name="paymentMethod"
          label={t('paymentMethod')}
          placeholder={t('selectPaymentMethod')}
          options={paymentMethodOptions}
          value={currentPaymentMethod || ''}
          onValueChange={(value) => {
            setParams({ paymentMethod: value || null, page: '1' });
          }}
        />
      </div>
    </AppDialog>
  );
}
