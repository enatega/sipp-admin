'use client';

import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { RatingSelectFilter } from '@/components/shared/filters/RatingSelectFilter';
import { StatusSelectFilter } from '@/components/shared/filters/StatusSelectFilter';
import { VehicleTypeSelectFilter } from '@/components/shared/filters/VehicleTypeSelectFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';
import { useTranslations } from 'next-intl';

interface AdvanceFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvanceFiltersDialog({
  open,
  onClose,
}: AdvanceFiltersDialogProps) {
  const t = useTranslations('driverManagement.driversTable.filters');
  const tTable = useTranslations('driverManagement.driversTable');

  const kycStatusOptions = [
    { key: tTable('pendingTab'), value: 'pending' },
    { key: tTable('approvedTab'), value: 'approved' },
    { key: tTable('rejectedTab'), value: 'rejected' },
  ];

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
              <ClearFiltersButton
                paramKeys={['zoneId', 'status', 'rating', 'vehicleType']}
              />
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
          label={t('zoneType')}
          placeholder={t('selectZone')}
        />
        <VehicleTypeSelectFilter
          paramKey="vehicleType"
          label={t('vehicleType')}
          placeholder={t('selectVehicleType')}
        />
        <StatusSelectFilter
          paramKey="status"
          label={t('kycStatus')}
          placeholder={t('selectKycStatus')}
          options={kycStatusOptions}
        />
        <RatingSelectFilter
          paramKey="rating"
          label={t('ratings')}
          placeholder={t('selectRating')}
        />
      </div>
    </AppDialog>
  );
}
