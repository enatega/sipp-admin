'use client';

import { fixedDeliveryFeeSchema } from '@/schemas/enatega-deliveries/delivery-fee/delivery-fee-forms-schema';
import { DeliveryFeeSettings } from '@/types';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { UpdateFixedDeliveryFeePayload } from '@/types/api/super-admin/enatega-deliveries/delivery-fee.api';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateFixedDeliveryFee } from '@/hooks/api/super-admin/enatega-deliveries/delivery-fee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';
import { Switch } from '@/components/ui/switch';

interface FixedDeliveryFeeFormProps {
  feeData: DeliveryFeeSettings | undefined;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}
export const FixedDeliveryFeeForm = ({
  feeData,
  isLoading,
  error,
}: FixedDeliveryFeeFormProps) => {
  const t = useTranslations('lumiFood.deliveryFee.fixed');
  const tButtons = useTranslations('lumiFood.deliveryFee.buttons');
  const initialValues: UpdateFixedDeliveryFeePayload = {
    fixed_delivery_fee: feeData ? Number(feeData.fixed_delivery_fee) : 0,
  };
  const isFixedFeeActive = Boolean(feeData?.is_fixed_delivery_fee_active);
  const [fixedFeeActive, setFixedFeeActive] = useState(isFixedFeeActive);
  const hasExistingFixedFee =
    Number(feeData?.fixed_delivery_fee ?? 0) > 0;

  useEffect(() => {
    setFixedFeeActive(isFixedFeeActive);
  }, [isFixedFeeActive]);

  // API
  const { mutateAsync: updateFixedDeliveryFee, isPending } =
    useUpdateFixedDeliveryFee();

  // Handler
  const handleSubmit = async (values: UpdateFixedDeliveryFeePayload) => {
    try {
      await updateFixedDeliveryFee({
        fixed_delivery_fee: values.fixed_delivery_fee,
        is_active: fixedFeeActive,
      });
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
      validationSchema={fixedDeliveryFeeSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form>
          <Card className="mt-6 py-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold">
                  {t('title')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={fixedFeeActive}
                    onCheckedChange={setFixedFeeActive}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <AppInput
                label={t('setLabel')}
                name="fixed_delivery_fee"
                type="number"
                placeholder={t('placeholder')}
                disabled={isLoading || isPending}
                helperText={t('fallbackHint')}
              />

              <div className="flex justify-end mt-4">
                <AppButton
                  type="submit"
                  className="px-14 bg-primary text-white"
                  isLoading={isLoading || isPending || isSubmitting}
                  disabled={isLoading || isPending || isSubmitting}
                >
                  {hasExistingFixedFee ? tButtons('update') : tButtons('save')}
                </AppButton>
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};
