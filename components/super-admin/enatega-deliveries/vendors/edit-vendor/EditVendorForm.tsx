'use client';

import { useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  EditVendorFormSchema,
  EditVendorFormValues,
} from '@/schemas/enatega-deliveries/vendor/vendor-form';
import { UpdateVendorPayload } from '@/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  useGetVendorDetail,
  useUpdateVendor,
} from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { BasicInformationSection } from './BasicInformationSection';
import { BusinessDocumentsSection } from './BusinessDocumentsSection';

export const EditVendorForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tSchema = useTranslations();
  const t = useTranslations('lumiFood.vendors.editVendor');
  const tToasts = useTranslations('lumiFood.vendors.editVendor.toasts');

  const vendorId = params?.id as string;
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch vendor details
  const { data: vendorData, isLoading } = useGetVendorDetail(vendorId);
  const vendorDataRecord = vendorData as unknown as
    | Record<string, unknown>
    | undefined;

  const existingLogo =
    (vendorDataRecord?.profile as string | undefined) ||
    (vendorDataRecord?.vendorimage as string | undefined) ||
    (vendorDataRecord?.businesstrademark as string | undefined) ||
    (vendorDataRecord?.business_trademark as string | undefined) ||
    null;

  // Update vendor mutation
  const { mutateAsync: updateVendor, isPending: isUpdatingVendor } =
    useUpdateVendor();

  const initialValues: EditVendorFormValues = useMemo(
    () => ({
      name: vendorData?.name || '',
      email: vendorData?.email || '',
      phone: vendorData?.phone || '',
      zone_id: vendorData?.zoneid || '',

      logo: existingLogo,
      business_license_front: vendorData?.businesslicensefront || null,
      business_license_back: vendorData?.businesslicenseback || null,
      national_id_passport_front: vendorData?.nationalidfront || null,
      national_id_passport_back: vendorData?.nationalidback || null,
    }),
    [existingLogo, vendorData],
  );

  const validationSchema = useMemo(
    () => EditVendorFormSchema(tSchema),
    [tSchema],
  );

  const handleSubmit = async (
    values: EditVendorFormValues,
    { setSubmitting }: FormikHelpers<EditVendorFormValues>,
  ) => {
    try {
      setSubmitting(true);
      setApiError(null);

      const payload: UpdateVendorPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        zone_id: values.zone_id,
        profile: values.logo instanceof File ? values.logo : undefined,
        business_liscence_front_file:
          values.business_license_front instanceof File
            ? values.business_license_front
            : undefined,
        business_liscence_back_file:
          values.business_license_back instanceof File
            ? values.business_license_back
            : undefined,
        national_id_front_file:
          values.national_id_passport_front instanceof File
            ? values.national_id_passport_front
            : undefined,
        national_id_back_file:
          values.national_id_passport_back instanceof File
            ? values.national_id_passport_back
            : undefined,
      };

      await updateVendor({ vendorId, payload });

      toast.success(tToasts('updateSuccess'));
      router.push(
        buildScopedDeliveriesAdminPathFromCurrent(
          pathname,
          '/enatega-deliveries/vendors',
        ),
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err?.response?.data?.message || tToasts('updateFailed');
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Skeleton className="h-7 w-52 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Skeleton className="h-7 w-56 mb-4" />
          <Skeleton className="h-4 w-72 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-28 col-span-2" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Skeleton className="h-11 w-32 rounded-[12px]" />
          <Skeleton className="h-11 w-36 rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">{t('vendorNotFound')}</div>
      </div>
    );
  }

  return (
    <Formik<EditVendorFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, handleSubmit: formikHandleSubmit, errors, touched }) => (
        <Form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            formikHandleSubmit();
          }}
        >
          <BasicInformationSection />

          <BusinessDocumentsSection />

          {/* Error Display */}
          <FormErrorDisplay
            formikErrors={errors}
            apiError={apiError}
            touched={touched}
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <AppButton
              type="button"
              variant="secondary"
              disabled={isSubmitting || isUpdatingVendor}
              className="px-12 rounded-[12px]"
              onClick={() => router.back()}
            >
              {t('cancelButton')}
            </AppButton>
            <AppButton
              type="submit"
              isLoading={isSubmitting || isUpdatingVendor}
              disabled={isSubmitting || isUpdatingVendor}
              className="px-12 rounded-[12px]"
            >
              {t('updateButton')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};
