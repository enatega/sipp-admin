'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateProfileValidationSchema } from '@/schemas/store/deliveries/update-profile.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { UpdateStoreDataPayload } from '@/types/api/store/deliveries/profile';
import { resolveCurrencySymbol } from '@/lib/formatCurrency';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetStoreProfile,
  useUpdateStoreData,
} from '@/hooks/api/store/deliveries/profile';
import { useGetAllVendorsSimple } from '@/hooks/api/deliveries/vendors';
import { useGetZonesSimple } from '@/hooks/api/common/zones';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import EditableDocumentField from '@/components/shared/form/EditableDocumentFIeld';
import { Heading } from '@/components/shared/Heading';

const UpdateProfileDetails = () => {
  const t = useTranslations('storeUpdateProfile');
  const tForm = useTranslations('storeUpdateProfile.form');
  const tSections = useTranslations('storeUpdateProfile.sections');
  const tErrors = useTranslations('storeUpdateProfile.errors');
  const tToast = useTranslations('storeUpdateProfile.toast');
  const tSchema = useTranslations('storeUpdateProfile.schema');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = resolveCurrencySymbol(currencySymbol);
  const params = useParams();
  const storeId = params?.storeId as string;
  const {
    data: getStoreProfile,
    isLoading,
    isError,
    error,
  } = useGetStoreProfile(storeId);
  const { data: vendors, isError: vendorIsError } = useGetAllVendorsSimple();
  const { data: zones, isError: zoneIsError } = useGetZonesSimple();

  const vendorOptions =
    vendors?.map((vendor) => ({
      key: vendor.name,
      value: vendor.id,
    })) || [];

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  const { mutateAsync: updateStore, isPending } = useUpdateStoreData();
  const router = useRouter();

  const initialValues = useMemo(() => {
    return {
      storeName: getStoreProfile?.profile.name,
      vendorId: getStoreProfile?.basicInformation.vendor.vendorId,
      email: getStoreProfile?.contactInformation.email ?? '',
      supportPhone: getStoreProfile?.contactInformation.phoneNumber ?? '',
      zoneId: getStoreProfile?.basicInformation.zoneId ?? '',
      // createdDate: getStoreProfile?.basicInformation.createdDate ?? '',
      tagLine: getStoreProfile?.basicInformation.tagLine ?? '',
      description: getStoreProfile?.basicInformation.description ?? '',
      minimumOrderValue:
        getStoreProfile?.basicInformation.minimumOrderValue?.toString() ?? '',
      notes: getStoreProfile?.additionalNotes ?? '',

      // Files start as null (new upload)
      businessLicenseFront: getStoreProfile?.kycDocuments.nationalIdFront ?? '',
      businessLicenseBack:
        getStoreProfile?.kycDocuments.businessLicenseBack ?? '',
      nationalIdFront: getStoreProfile?.kycDocuments.nationalIdFront ?? '',
      nationalIdBack: getStoreProfile?.kycDocuments.nationalIdBack ?? '',
      storeRegistrationDocument:
        getStoreProfile?.kycDocuments.registeredStoreDocs ?? '',
      taxCertificate: getStoreProfile?.kycDocuments.taxIdCertificate ?? '',
    };
  }, [getStoreProfile]);

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const formData = new FormData();

      // Required payload
      formData.append('storeId', storeId);
      formData.append('storeName', values.storeName ?? '');
      formData.append('email', values.email ?? '');
      formData.append('phone', values.supportPhone ?? '');
      formData.append('zoneId', values.zoneId ?? '');
      formData.append('minimumOrder', values.minimumOrderValue ?? '0');
      formData.append('tagLine', values.tagLine ?? '');
      formData.append('description', values.description ?? '');
      formData.append('notes', values.notes ?? '');

      // Helper to append file only if it's a File object
      const appendFileIfExists = (
        fieldName: string,
        value: string | File | null,
      ) => {
        if (value instanceof File) {
          formData.append(fieldName, value);
        }
      };

      appendFileIfExists('businessLicenseFront', values.businessLicenseFront);
      appendFileIfExists('businessLicenseBack', values.businessLicenseBack);
      appendFileIfExists('nationalIdFront', values.nationalIdFront);
      appendFileIfExists('nationalIdBack', values.nationalIdBack);
      appendFileIfExists(
        'registeredStoreDocs',
        values.storeRegistrationDocument,
      );
      appendFileIfExists('taxIdCertificate', values.taxCertificate);

      // Call mutation with FormData
      const response = await updateStore(
        formData as unknown as UpdateStoreDataPayload,
      );

      toast.success(response.message || tToast('updateSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };
  if (isLoading) return [1, 2, 3, 4].map((i) => <CardShimmer key={i} />);
  if (isError)
    return (
      <DisplayError
        variant="error"
        message={returnErrorMessage(error as ApiErrorResponse)}
        title={tErrors('fetchFailedTitle')}
      />
    );
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateProfileValidationSchema(tSchema)}
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
              <h3 className="text-lg font-semibold text-foreground">
                {tSections('storeInformation')}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <AppInputField
                  name="storeName"
                  label={tForm('storeNameLabel')}
                />
                <AppSelect
                  name="vendorId"
                  label={tForm('vendorNameLabel')}
                  placeholder={tForm('vendorPlaceholder')}
                  options={vendorOptions}
                  error={vendorIsError ? tForm('vendorFetchFailed') : ''}
                />
                <AppInputField
                  name="email"
                  label={tForm('emailLabel')}
                  type="email"
                />
                <AppInputField
                  name="supportPhone"
                  label={tForm('supportPhoneLabel')}
                />
                <AppSelect
                  name="zoneId"
                  label={tForm('zoneLabel')}
                  placeholder={tForm('zonePlaceholder')}
                  options={zoneOptions}
                  error={zoneIsError ? tForm('zoneFetchFailed') : ''}
                />
                <AppInputField name="tagLine" label={tForm('tagLineLabel')} />
              </div>
              <AppInputField
                name="minimumOrderValue"
                label={tForm('minimumOrderValueLabel', {
                  currencySymbol: resolvedCurrencySymbol,
                })}
                prefix={resolvedCurrencySymbol}
              />
              <div className="mt-6">
                <AppTextarea
                  name="description"
                  label={tForm('descriptionLabel')}
                  rows={4}
                  placeholder={tForm('descriptionPlaceholder')}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {tSections('additionalNotes')}
              </h3>
              <div className="mt-4">
                <AppTextarea
                  name="notes"
                  label={tForm('notesLabel')}
                  rows={4}
                  placeholder={tForm('notesPlaceholder')}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {tSections('kycDocuments')}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <EditableDocumentField
                  name="businessLicenseFront"
                  label={tForm('businessLicenseFrontLabel')}
                  existingImageUrl={initialValues.businessLicenseFront}
                />

                <EditableDocumentField
                  name="businessLicenseBack"
                  label={tForm('businessLicenseBackLabel')}
                  existingImageUrl={initialValues.businessLicenseBack}
                />
                <EditableDocumentField
                  name="nationalIdFront"
                  label={tForm('nationalIdFrontLabel')}
                  existingImageUrl={initialValues.nationalIdFront}
                />
                <EditableDocumentField
                  name="nationalIdBack"
                  label={tForm('nationalIdBackLabel')}
                  existingImageUrl={initialValues.nationalIdBack}
                />
                <EditableDocumentField
                  name="storeRegistrationDocument"
                  label={tForm('storeRegistrationDocumentLabel')}
                  existingImageUrl={initialValues.storeRegistrationDocument}
                />
                <EditableDocumentField
                  name="taxCertificate"
                  label={tForm('taxCertificateLabel')}
                  existingImageUrl={initialValues.taxCertificate}
                />
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-2">
              <AppButton
                type="button"
                variant="secondary"
                className="rounded-[12px] px-8"
                onClick={() => router.back()}
              >
                {tForm('cancelButton')}
              </AppButton>
              <AppButton
                type="submit"
                className="rounded-[12px] px-8"
                disabled={isPending}
              >
                {tForm('updateProfileButton')}
              </AppButton>
            </div>
          </main>
        </Form>
      )}
    </Formik>
  );
};

export default UpdateProfileDetails;
