'use client';

import * as React from 'react';
import { useMemo } from 'react';
import {
  RiderStep3Data,
  useRiderFormContext,
} from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { RiderFormStep3Schema } from '@/schemas/enatega-deliveries/riders/rider-form';
import { Form, Formik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetVehicleTypes } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { AppButton } from '@/components/shared/AppButton';
import { AppCheckBox } from '@/components/shared/AppCheckBox';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';

const EMPTY_STEP3: RiderStep3Data = {
  vehicle_brand: '',
  model_year_limit: '',
  vehicle_color: '',
  vehicle_number: '',
  vehicle_type: '',

  vehicle_in_good_condition: false,
  insulated_delivery_bag: false,
  air_conditioning: false,
  helmet: false,
};

export const Step3Form: React.FC = () => {
  const t = useTranslations('driverManagement.addDriver.step3');
  const tVehicle = useTranslations('driverManagement.addDriver.vehicleTypeSelect');
  const { prevStep, formData, nextStep, setStep3Data } = useRiderFormContext();
  const { data: vehicleTypesData, isLoading: isLoadingVehicleTypes } =
    useGetVehicleTypes();

  const vehicleTypeOptions = useMemo(() => {
    return vehicleTypesData?.map((type) => ({
      key: type.name,
      // The API resolves vehicle types by ID, while `name` is display-only.
      value: type.id,
    })) || [];
  }, [vehicleTypesData]);

  const initialValues = useMemo<RiderStep3Data>(
    () => (formData.step3 as RiderStep3Data | null) ?? EMPTY_STEP3,
    [formData.step3],
  );

  const handleSubmit = async (
    values: RiderStep3Data,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      setSubmitting(true);
      setStep3Data(values);
      nextStep();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black">
          {t('title')}
        </h2>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize // ← important
        validationSchema={RiderFormStep3Schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => {
          const selectedVehicleTypeName = vehicleTypesData?.find(
            (type) => type.id === values.vehicle_type,
          )?.name?.toLowerCase() || '';

          return (
            <Form className="space-y-6">
            <AppSelect
              label={tVehicle('label')}
              name="vehicle_type"
              placeholder={tVehicle('placeholder')}
              options={vehicleTypeOptions}
              loading={isLoadingVehicleTypes}
              requiredAsterisk
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInputField
                label={t('vehicleNameLabel')}
                name="vehicle_brand"
                type="text"
                placeholder={t('vehicleNamePlaceholder')}
                requiredAsterisk
              />
              <AppInputField
                label={t('modelYearLimitLabel')}
                name="model_year_limit"
                type="number"
                placeholder={t('modelYearLimitPlaceholder')}
                requiredAsterisk
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInputField
                label={t('vehicleColourLabel')}
                name="vehicle_color"
                type="text"
                placeholder={t('vehicleColourPlaceholder')}
                requiredAsterisk
              />
              <AppInputField
                label={t('vehicleNoLabel')}
                name="vehicle_number"
                type="text"
                placeholder={t('vehicleNoPlaceholder')}
                requiredAsterisk
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppCheckBox
                name="vehicle_in_good_condition"
                label={t('vehicleInGoodCondition')}
                requiredAsterisk
              />

              <AppCheckBox
                name="insulated_delivery_bag"
                label={t('insulatedDeliveryBag')}
                requiredAsterisk
              />
            </div>

            {/* Conditional fields based on vehicle type */}
            {selectedVehicleTypeName === 'car' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AppCheckBox
                  name="air_conditioning"
                  label={t('airConditioning')}
                />
                <div className="hidden md:block" />
              </div>
            )}

            {selectedVehicleTypeName === 'bike' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AppCheckBox
                  name="helmet"
                  label={t('helmet')}
                />
                <div className="hidden md:block" />
              </div>
            )}

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
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-12 rounded-[12px] mt-4"
              >
                {t('nextButton')}
              </AppButton>
            </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
