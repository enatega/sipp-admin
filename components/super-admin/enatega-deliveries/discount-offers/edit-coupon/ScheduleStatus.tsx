'use client';

import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { AppDateTimeInput } from '@/components/shared/form/AppDateTimeInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { EditCouponFormData } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';

export function ScheduleStatus() {
  const t = useTranslations(
    'lumiFood.discountsOffers.editCoupon.scheduleStatus',
  );
  const { values } = useFormikContext<EditCouponFormData>();
  return (
    <div className="bg-white p-10 rounded-md shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <AppDateTimeInput
          name="startDate"
          label={t('startDateLabel')}
          placeholder={t('startDatePlaceholder')}
          requiredAsterisk
          disabled={values.isAlreadyActive || values.activeImmediately}
        />
        <AppDateTimeInput
          name="endDate"
          label={t('endDateLabel')}
          placeholder={t('endDatePlaceholder')}
          requiredAsterisk
        />
        <AppSwitch
          name="activeImmediately"
          label="Active Immediately"
          disabled={values.isAlreadyActive}
        />
      </div>
    </div>
  );
}
