'use client';

import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { EditRiderFormValues } from '@/schemas/enatega-deliveries/riders/rider-form';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';

export const CodLimitSettingsSection = () => {
  const t = useTranslations('driverManagement.editDriver');
  const { values } = useFormikContext<EditRiderFormValues>();

  const warningThresholdOptions = useMemo(
    () => [
      { key: t('warningThresholdOption70'), value: '70' },
      { key: t('warningThresholdOption80'), value: '80' },
      { key: t('warningThresholdOption90'), value: '90' },
    ],
    [t],
  );

  const settlementCycleOptions = useMemo(
    () => [
      { key: t('settlementCycleDaily'), value: 'daily' },
      { key: t('settlementCycleWeekly'), value: 'weekly' },
      { key: t('settlementCycleMonthly'), value: 'monthly' },
    ],
    [t],
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('codLimitTitle')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {t('codLimitDescription')}
      </p>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <AppSwitch
            name="cod_limit_enabled"
            label={t('enableCodLimitLabel')}
            helperText={t('enableCodLimitDescription')}
          />
        </div>

        {values.cod_limit_enabled && (
          <>
            <AppInputField
              label={t('codLimitAmountLabel')}
              name="cod_limit_amount"
              type="number"
              placeholder={t('codLimitAmountPlaceholder')}
              requiredAsterisk
              helperText={t('codLimitAmountHelper')}
            />

            <AppSelect
              label={t('warningThresholdLabel')}
              name="cod_warning_threshold"
              placeholder={t('warningThresholdPlaceholder')}
              options={warningThresholdOptions}
              helperText={t('warningThresholdHelper')}
            />

            <AppSelect
              label={t('autoSettlementCycleLabel')}
              name="cod_auto_settlement_cycle"
              placeholder={t('autoSettlementCyclePlaceholder')}
              options={settlementCycleOptions}
              helperText={t('autoSettlementCycleHelper')}
            />
          </>
        )}

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <AppSwitch
            name="cod_allow_online_payments_when_blocked"
            label={t('allowOnlinePaymentsWhenCodBlockedLabel')}
            helperText={t('allowOnlinePaymentsWhenCodBlockedDescription')}
          />
        </div>
      </div>
    </div>
  );
};
