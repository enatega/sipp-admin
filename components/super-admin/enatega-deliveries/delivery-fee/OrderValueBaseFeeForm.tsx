'use client';

import { orderValueBaseFeeSchema } from '@/schemas/enatega-deliveries/delivery-fee/delivery-fee-forms-schema';
import { ApiErrorResponse, DeliveryFeeSettings } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { UpdateOrderValueBaseDeliveryFeePayload } from '@/types/api/super-admin/enatega-deliveries/delivery-fee.api';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateOrderValueBasedDeliveryFee } from '@/hooks/api/super-admin/enatega-deliveries/delivery-fee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';

interface FixedDeliveryFeeFormProps {
  feeData: DeliveryFeeSettings | undefined;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}
export const OrderValueBaseFeeForm = ({
  feeData,
  isLoading,
  error,
}: FixedDeliveryFeeFormProps) => {
  const t = useTranslations('lumiFood.deliveryFee.orderValue');
  const tButtons = useTranslations('lumiFood.deliveryFee.buttons');
  const initialValues: UpdateOrderValueBaseDeliveryFeePayload = {
    min_order_value: feeData ? Number(feeData.min_order_value) : 0,
    delivery_fee_above_min_order: feeData
      ? Number(feeData.delivery_fee_above_min_order)
      : 0,
  };
  const hasExistingOrderValueFee =
    Number(feeData?.min_order_value ?? 0) > 0 ||
    Number(feeData?.delivery_fee_above_min_order ?? 0) > 0;

  // API
  const { mutateAsync: updateDeliveryFee, isPending } =
    useUpdateOrderValueBasedDeliveryFee();

  const handleSubmit = async (
    values: UpdateOrderValueBaseDeliveryFeePayload,
  ) => {
    try {
      await updateDeliveryFee(values);
      toast.success(t('success'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };
  if (isLoading) return <CardShimmer />;
  if (error) {
    return (
      <Card>
        <CardContent className="py-10">
          <DisplayError
            title={t('loadFailedTitle')}
            message={returnErrorMessage(error as ApiErrorResponse)}
          />
        </CardContent>
      </Card>
    );
  }
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={orderValueBaseFeeSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form>
          <Card className="mt-6 py-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t('title')}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppInput
                  label={t('minimumOrderValueLabel')}
                  name="min_order_value"
                  type="number"
                  disabled={isSubmitting || isPending}
                />

                <AppInput
                  label={t('deliveryFeeAboveMinOrderLabel')}
                  name="delivery_fee_above_min_order"
                  type="number"
                  disabled={isSubmitting || isPending}
                />
              </div>

              {/* <p className=" flex text-sm text-muted-foreground gap-2 mt-4">
                <CircleAlert height={20} width={20} />
                Free delivery applies to orders greater than $200.
              </p> */}

              <div className="flex justify-end mt-4">
                <AppButton
                  type="submit"
                  className="px-14 bg-primary text-white"
                  isLoading={isLoading || isPending || isSubmitting}
                  disabled={isLoading || isPending || isSubmitting}
                >
                  {hasExistingOrderValueFee
                    ? tButtons('update')
                    : tButtons('save')}
                </AppButton>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};
