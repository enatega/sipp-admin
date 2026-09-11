'use client';

import * as React from 'react';
import { useMemo } from 'react';
import {
  RiderStep2Data,
  useRiderFormContext,
} from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';
import { RiderFormStep2Schema } from '@/schemas/enatega-deliveries/riders/rider-form';
import { Form, Formik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';

const EMPTY_STEP2: RiderStep2Data = {
  profile_picture: null,
  driver_license_front: null,
  driver_license_back: null,
  national_id_front: null,
  national_id_back: null,
  vehicle_registration_front: null,
  vehicle_registration_back: null,
  company_commercial_registration: null,
};

export const Step2Form: React.FC = () => {
  const t = useTranslations('driverManagement.addDriver.step2');
  const { setStep2Data, nextStep, prevStep, formData } = useRiderFormContext();

  const initialValues = useMemo<RiderStep2Data>(
    () => (formData.step2 as RiderStep2Data | null) ?? EMPTY_STEP2,
    [formData.step2],
  );

  const handleSubmit = async (
    values: RiderStep2Data,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      setSubmitting(true);
      setStep2Data(values);
      nextStep();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black">{t('title')}</h2>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize // ← important
        validationSchema={RiderFormStep2Schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFileInput
                name="profile_picture"
                label={t('profilePicture')}
                requiredAsterisk
                previewHeight={120}
              />
              <div className="hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFileInput
                name="driver_license_front"
                label={t('driverLicenseFront')}
                requiredAsterisk
                previewHeight={120}
              />
              <AppFileInput
                name="driver_license_back"
                label={t('driverLicenseBack')}
                requiredAsterisk
                previewHeight={120}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFileInput
                name="national_id_front"
                label={t('nationalIdPassportFront')}
                requiredAsterisk
                previewHeight={120}
              />
              <AppFileInput
                name="national_id_back"
                label={t('nationalIdPassportBack')}
                requiredAsterisk
                previewHeight={120}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFileInput
                name="vehicle_registration_front"
                label={t('vehicleRegistrationFront')}
                requiredAsterisk
                previewHeight={120}
              />
              <AppFileInput
                name="vehicle_registration_back"
                label={t('vehicleRegistrationBack')}
                requiredAsterisk
                previewHeight={120}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFileInput
                name="company_commercial_registration"
                label={t('companyCommercialRegistrationOptional')}
                previewHeight={120}
              />
              <div className="hidden md:block" />
            </div>

            <div className="flex items-center justify-end gap-4 border-t pt-2">
              <AppButton
                type="button"
                variant="secondary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
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
        )}
      </Formik>
    </div>
  );
};
