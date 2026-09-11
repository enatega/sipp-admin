'use client';

import { useParams } from 'next/navigation';
import { storePaymentsValidationSchema } from '@/schemas/store/deliveries/payments.schema';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateStoreData } from '@/hooks/api/store/deliveries/profile';
import { useGetStorePaymentInfo } from '@/hooks/api/store/deliveries/store-payment';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Heading } from '@/components/shared/Heading';

const PaymentsDetails = () => {
  const t = useTranslations('storePayments');
  const tForm = useTranslations('storePayments.form');
  const tErrors = useTranslations('storePayments.errors');
  const tToast = useTranslations('storePayments.toast');
  const tSchema = useTranslations('storePayments.schema');
  const params = useParams();
  const storeId = params?.storeId as string;
  const queryClient = useQueryClient();
  const { mutateAsync: updateStore, isPending } = useUpdateStoreData();
  const { data, isLoading, isError, error } = useGetStorePaymentInfo(storeId);

  const initialValues = {
    bankName: data?.bank_name ?? '',
    accountHolderName: data?.account_holder_name ?? '',
    accountNumberIban: data?.account_number ?? '',
    branchCode: data?.branch_code ?? '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const response = await updateStore({
        storeId,
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        accountNumber: values.accountNumberIban,
        branchCode: values.branchCode,
      });
      toast.success(response.message || tToast('updateSuccess'));
      queryClient.invalidateQueries({
        queryKey: ['store-payment-info', storeId],
      });
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };
  if (isLoading) return <CardShimmer />;
  if (isError)
    return (
      <DisplayError
        title={tErrors('fetchFailedTitle')}
        message={returnErrorMessage(error)}
        variant="error"
      />
    );
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={storePaymentsValidationSchema(tSchema)}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit: formikHandleSubmit }) => (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            formikHandleSubmit();
          }}
        >
          <main className="space-y-8 w-full rounded-xl border bg-white p-4 md:p-6">
            <Heading title={t('title')} />
            <section className="">
              <div className="grid gap-6">
                <AppInputField
                  name="bankName"
                  label={tForm('bankNameLabel')}
                  placeholder={tForm('bankNamePlaceholder')}
                />
                <AppInputField
                  name="accountHolderName"
                  label={tForm('accountHolderNameLabel')}
                  placeholder={tForm('accountHolderNamePlaceholder')}
                />
                <AppInputField
                  name="accountNumberIban"
                  label={tForm('accountNumberIbanLabel')}
                  placeholder={tForm('accountNumberIbanPlaceholder')}
                />
                <AppInputField
                  name="branchCode"
                  label={tForm('branchCodeLabel')}
                  placeholder={tForm('branchCodePlaceholder')}
                />
              </div>
            </section>

            <div className="flex items-center justify-end">
              <AppButton
                type="submit"
                className="rounded-[12px] px-8"
                disabled={isPending}
              >
                {tForm('saveButton')}
              </AppButton>
            </div>
          </main>
        </Form>
      )}
    </Formik>
  );
};

export default PaymentsDetails;
