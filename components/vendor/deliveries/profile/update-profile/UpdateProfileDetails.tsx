'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createUpdateProfileValidationSchema } from '@/schemas/vendor/deliveries/profile/update-profile.schema';
import { ApiErrorResponse, UpdateVendorProfilePayload } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useUpdateVendorProfile,
  useVendorProfile,
} from '@/hooks/api/vendor/deliveries/profile';
import { Spinner } from '@/components/ui/spinner';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { Heading } from '@/components/shared/Heading';
import { UpdateProfileShimmer } from './UpdateProfileShimmer';

interface UpdateProfileFormValues {
  vendorName: string;
  email: string;
  phone: string;
  city: string;
  notes: string;
  businessLicenseFront: string | null;
  businessLicenseBack: string | null;
  nationalIdFront: string | null;
  nationalIdBack: string | null;
}

const UpdateProfileDetails = () => {
  
  const t = useTranslations('vendorProfile.updateForm');
  const tSections = useTranslations('vendorProfile.updateForm.sections');
  const tLabels = useTranslations('vendorProfile.updateForm.labels');
  const tPlaceholders = useTranslations(
    'vendorProfile.updateForm.placeholders',
  );
  const tActions = useTranslations('vendorProfile.updateForm.actions');
  const tToast = useTranslations('vendorProfile.updateForm.toast');
  const tValidation = useTranslations('vendorProfile.updateForm.validation');
  const tFallback = useTranslations('vendorProfile.updateForm.fallback');
  const notAvailable = tFallback('notAvailable');

  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };

  const { data: vendorProfile, isLoading } = useVendorProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateVendorProfile();

  const validationSchema = useMemo(
    () => createUpdateProfileValidationSchema(tValidation),
    [tValidation],
  );

  const initialValues = useMemo<UpdateProfileFormValues>(
    () => ({
      vendorName: vendorProfile?.name || notAvailable,
      email: vendorProfile?.email || notAvailable,
      phone: vendorProfile?.phone || notAvailable,
      city: vendorProfile?.city || notAvailable,
      notes: vendorProfile?.notes || notAvailable,
      businessLicenseFront:
        vendorProfile?.business_license_front ||
        '/images/enatega-deliveries/profile.jpg',
      businessLicenseBack:
        vendorProfile?.business_license_back || '/images/enatega-deliveries/profile.jpg',
      nationalIdFront:
        vendorProfile?.national_id_front || '/images/enatega-deliveries/profile.jpg',
      nationalIdBack:
        vendorProfile?.national_id_back || '/images/enatega-deliveries/profile.jpg',
    }),
    [notAvailable, vendorProfile],
  );

  const handleSubmit = async (value: UpdateProfileFormValues) => {
    try {
      const payload: UpdateVendorProfilePayload = {
        vendorId: vendorId || '',
        name: value?.vendorName,
        email: value?.email,
        phone: value?.phone,
        city: value?.city,
        notes: value?.notes,
        business_liscence_front_file: value?.businessLicenseFront as string,
        business_liscence_back_file: value?.businessLicenseBack as string,
        national_id_front_file: value?.nationalIdFront as string,
        national_id_back_file: value?.nationalIdBack as string,
      };

      await updateProfile(payload);
      toast.success(tToast('updateSuccess'));
      setTimeout(() => {
        router.push(`/vendor/deliveries/${vendorId}/profile`);
      }, 1000);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit: formikHandleSubmit }) => (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            formikHandleSubmit();
          }}
        >
          <main className="space-y-8">
            <Heading title={t('title')} showBackBtn />
            <section className="rounded-xl border bg-white p-4 md:p-6">
              {isLoading && <UpdateProfileShimmer />}

              <h3 className="text-lg font-semibold text-foreground">
                {tSections('vendorInformation')}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <AppInputField
                  name="vendorName"
                  label={tLabels('vendorName')}
                />
                <AppInputField
                  name="email"
                  label={tLabels('email')}
                  type="email"
                />
                <AppInputField name="phone" label={tLabels('phone')} />
                <AppInputField name="city" label={tLabels('city')} />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {tSections('additionalNotes')}
              </h3>
              <div className="mt-4">
                <AppTextarea
                  name="notes"
                  label={tLabels('notes')}
                  rows={4}
                  placeholder={tPlaceholders('notes')}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {tSections('kycDocuments')}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AppFileInput
                  name="businessLicenseFront"
                  label={tLabels('businessLicenseFront')}
                  disabled={vendorProfile?.status === 'approved'}
                  showClearButton={vendorProfile?.status !== 'approved'}
                />
                <AppFileInput
                  name="businessLicenseBack"
                  label={tLabels('businessLicenseBack')}
                  disabled={vendorProfile?.status === 'approved'}
                  showClearButton={vendorProfile?.status !== 'approved'}
                />
                <AppFileInput
                  name="nationalIdFront"
                  label={tLabels('nationalIdFront')}
                  disabled={vendorProfile?.status === 'approved'}
                  showClearButton={vendorProfile?.status !== 'approved'}
                />
                <AppFileInput
                  name="nationalIdBack"
                  label={tLabels('nationalIdBack')}
                  disabled={vendorProfile?.status === 'approved'}
                  showClearButton={vendorProfile?.status !== 'approved'}
                />
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-2">
              <AppButton
                type="button"
                variant="secondary"
                disabled={isPending}
                className="px-8 rounded-[12px]"
                onClick={() => router.back()}
              >
                {tActions('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                className="px-8 rounded-[12px]"
                disabled={isPending}
              >
                {isPending ? (
                  <Spinner className="size-5 m-10" />
                ) : (
                  tActions('update')
                )}
              </AppButton>
            </div>
          </main>
        </Form>
      )}
    </Formik>
  );
};

export default UpdateProfileDetails;
