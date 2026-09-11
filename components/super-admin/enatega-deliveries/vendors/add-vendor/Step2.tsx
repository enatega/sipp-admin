'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useVendorFormContext,
  VendorStep2Data,
} from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';
import { VendorFormStep2Schema } from '@/schemas/enatega-deliveries/vendor/vendor-form';
import { CreateVendorPayload } from '@/types';
import { Form, Formik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useCreateVendor } from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { AppButton } from '@/components/shared/AppButton';
import EditableDocumentField from '@/components/shared/form/EditableDocumentFIeld';
import { EMPTY_STEP2 } from './data';

export const Step2Form: React.FC = () => {
  const { setStep2Data, prevStep, formData, resetForm } =
    useVendorFormContext();
  const tSchema = useTranslations();
  const t = useTranslations('lumiFood.vendors.addVendor.step2');
  const tToasts = useTranslations('lumiFood.vendors.addVendor.step2.toasts');
  const router = useRouter();
  const pathname = usePathname();

  const { mutateAsync: createVendor, isPending: isCreatingVendor } =
    useCreateVendor();

  const initialValues = useMemo<VendorStep2Data>(
    () => (formData.step2 as VendorStep2Data | null) ?? EMPTY_STEP2,
    [formData.step2],
  );

  const handleSubmit = async (
    values: VendorStep2Data,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      setSubmitting(true);
      setStep2Data(values);

      // Combine step1 and step2 data to create the payload
      if (!formData.step1) {
        toast.error(tToasts('step1Required'));
        return;
      }

      const payload: CreateVendorPayload = {
        name: formData.step1.name,
        email: formData.step1.email,
        phone: formData.step1.phone,
        password: formData.step1.password,
        zone_id: formData.step1.zone_id,
        allow_password_change: formData.step1.changePasswordAllowed ?? false,
        sendCredentialsViaEmail: formData.step1.mailLoginCredentials ?? false,
        vendorImage: values.logo ?? null,
        business_liscence_front_file: values.business_license_front ?? null,
        business_liscence_back_file: values.business_license_back ?? null,
        national_id_front_file: values.national_id_passport_front ?? null,
        national_id_back_file: values.national_id_passport_back ?? null,
        business_trademark_file: values.logo ?? null,
      };

      await createVendor(payload);

      toast.success(tToasts('createdSuccess'));
      resetForm();
      router.push(
        buildScopedDeliveriesAdminPathFromCurrent(
          pathname,
          '/enatega-deliveries/vendors',
        ),
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || tToasts('createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={VendorFormStep2Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <EditableDocumentField
                  name="logo"
                  label={t('businessTrademarkLabel')}
                  requiredAsterisk
                />
              </div>
              <EditableDocumentField
                name="business_license_front"
                label={t('businessLicenseFrontLabel')}
                requiredAsterisk
              />
              <EditableDocumentField
                name="business_license_back"
                label={t('businessLicenseBackLabel')}
                requiredAsterisk
              />
              <EditableDocumentField
                name="national_id_passport_front"
                label={t('nationalIdPassportFrontLabel')}
                requiredAsterisk
              />
              <EditableDocumentField
                name="national_id_passport_back"
                label={t('nationalIdPassportBackLabel')}
                requiredAsterisk
              />
            </div>

            <div className="flex items-center justify-end gap-4 border-t pt-4 mt-6">
              <AppButton
                type="button"
                variant="secondary"
                disabled={isSubmitting || isCreatingVendor}
                className="px-12 rounded-[12px]"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting || isCreatingVendor}
                disabled={isSubmitting || isCreatingVendor}
                className="px-12 rounded-[12px]"
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
