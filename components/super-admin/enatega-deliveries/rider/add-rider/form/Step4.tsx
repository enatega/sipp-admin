'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiderStep4Data,
  useRiderFormContext,
} from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { RiderFormStep4Schema } from '@/schemas/enatega-deliveries/riders/rider-form';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCreateDeliveryRider } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';

const EMPTY_STEP4: RiderStep4Data = {
  cod_limit_enabled: false,
  cod_limit_amount: '',
  cod_warning_threshold: '80',
  cod_auto_settlement_cycle: 'daily',
  cod_allow_online_payments_when_blocked: true,
};

export const Step4Form: React.FC = () => {
  const t = useTranslations('driverManagement.addDriver.step4');
  const tStep2 = useTranslations('driverManagement.addDriver.step2');
  const tStep3 = useTranslations('driverManagement.addDriver.step3');
  const router = useRouter();
  const { prevStep, formData, resetForm, setStep4Data } = useRiderFormContext();
  const { mutateAsync: createRider, isPending: isCreating } =
    useCreateDeliveryRider();

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

  const initialValues = useMemo<RiderStep4Data>(
    () => (formData.step4 as RiderStep4Data | null) ?? EMPTY_STEP4,
    [formData.step4],
  );

  const handleSubmit = async (
    values: RiderStep4Data,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      setSubmitting(true);
      setStep4Data(values);

      if (!formData.step1) {
        toast.error(tStep3('completeStep1Error'));
        return;
      }

      if (!formData.step2) {
        toast.error(tStep3('completeStep2Error'));
        return;
      }

      if (!formData.step3) {
        toast.error(t('completeStep3Error'));
        return;
      }

      const requiredDocMappings: Array<{
        key:
          | 'driver_license_front'
          | 'driver_license_back'
          | 'national_id_front'
          | 'national_id_back'
          | 'vehicle_registration_front'
          | 'vehicle_registration_back';
        label: string;
      }> = [
        { key: 'driver_license_front', label: tStep2('driverLicenseFront') },
        { key: 'driver_license_back', label: tStep2('driverLicenseBack') },
        {
          key: 'national_id_front',
          label: tStep2('nationalIdPassportFront'),
        },
        { key: 'national_id_back', label: tStep2('nationalIdPassportBack') },
        {
          key: 'vehicle_registration_front',
          label: tStep2('vehicleRegistrationFront'),
        },
        {
          key: 'vehicle_registration_back',
          label: tStep2('vehicleRegistrationBack'),
        },
      ];

      for (const { key, label } of requiredDocMappings) {
        const file = formData.step2[key];
        if (!file) {
          toast.error(tStep3('missingRequiredDocumentError', { label }));
          return;
        }
      }

      await createRider({
        name: formData.step1.name,
        email: formData.step1.email,
        password: formData.step1.password,
        phone: formData.step1.phone,
        city: formData.step1.zone_id,
        zone_id: formData.step1.zone_id,
        change_password_allowed: formData.step1.send_login_credentials_email,

        driver_license_front: formData.step2.driver_license_front!,
        driver_license_back: formData.step2.driver_license_back!,
        national_id_passport_front: formData.step2.national_id_front!,
        national_id_passport_back: formData.step2.national_id_back!,
        vehicle_registration_front: formData.step2.vehicle_registration_front!,
        vehicle_registration_back: formData.step2.vehicle_registration_back!,
        company_commercial_registration:
          formData.step2.company_commercial_registration || undefined,
        profile_image: formData.step2.profile_picture || undefined,

        vehicle_type: formData.step3.vehicle_type,
        vehicle_name: formData.step3.vehicle_brand,
        model_year_limit:
          formData.step3.model_year_limit !== '' &&
          formData.step3.model_year_limit !== null
            ? Number(formData.step3.model_year_limit)
            : 2020,
        vehicle_colour: formData.step3.vehicle_color,
        vehicle_no: formData.step3.vehicle_number,
        insulated_delivery_bag: formData.step3.insulated_delivery_bag,
        bike_good_condition: formData.step3.vehicle_in_good_condition,
        air_conditioning: formData.step3.air_conditioning,
        helmet: formData.step3.helmet,
        licenseNumber: '',

        cod_limit_enabled: values.cod_limit_enabled,
        cod_limit_amount:
          values.cod_limit_enabled &&
          values.cod_limit_amount !== null &&
          values.cod_limit_amount !== ''
            ? Number(values.cod_limit_amount)
            : undefined,
        cod_warning_threshold: values.cod_limit_enabled
          ? Number(values.cod_warning_threshold)
          : undefined,
        cod_auto_settlement_cycle: values.cod_limit_enabled
          ? values.cod_auto_settlement_cycle
          : undefined,
        cod_allow_online_payments_when_blocked: values.cod_limit_enabled
          ? values.cod_allow_online_payments_when_blocked
          : undefined,
      });

      toast.success(tStep3('riderCreatedSuccess'));
      resetForm();
      router.back();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={RiderFormStep4Schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
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

            <div className="flex items-center justify-end gap-4 border-t pt-2">
              <AppButton
                type="button"
                variant="secondary"
                className="px-12 rounded-[12px] mt-4 gap-1"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting || isCreating}
                disabled={isSubmitting || isCreating}
                className="px-12 rounded-[12px] mt-4"
              >
                {t('submitButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
