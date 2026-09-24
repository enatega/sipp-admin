'use client';

import { distanceBaseFeeSchema } from '@/schemas/enatega-deliveries/delivery-fee/delivery-fee-forms-schema';
import { DeliveryFeeSettings } from '@/types';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { UpdateDistanceDeliveryFeePayload } from '@/types/api/super-admin/enatega-deliveries/delivery-fee.api';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateDistanceBasedDeliveryFee } from '@/hooks/api/super-admin/enatega-deliveries/delivery-fee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';
import { Switch } from '@/components/ui/switch';

interface DistanceBaseFeeFormProps {
  feeData: DeliveryFeeSettings | undefined;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}
export const DistanceBaseFeeForm = ({
  feeData,
  isLoading,
  error,
}: DistanceBaseFeeFormProps) => {
  const t = useTranslations('lumiFood.deliveryFee.distance');
  const tButtons = useTranslations('lumiFood.deliveryFee.buttons');
  const initialValues: UpdateDistanceDeliveryFeePayload = {
    base_distance_fee: feeData ? Number(feeData.base_distance_fee) : 0,
    distance_greater_than: feeData ? Number(feeData.distance_greater_than) : 0,
    per_km_charges: feeData ? Number(feeData.per_km_charges) : 0,
    apply_base_fee_up_per_km: false,
  };
  const isDistanceFeeActive = Boolean(feeData?.is_distance_delivery_fee_active);
  const [distanceFeeActive, setDistanceFeeActive] = useState(isDistanceFeeActive);
  const hasExistingDistanceFee =
    Number(feeData?.base_distance_fee ?? 0) > 0 ||
    Number(feeData?.distance_greater_than ?? 0) > 0 ||
    Number(feeData?.per_km_charges ?? 0) > 0;

  useEffect(() => {
    setDistanceFeeActive(isDistanceFeeActive);
  }, [isDistanceFeeActive]);
  // API
  const { mutateAsync: updateDistanceDeliveryFee, isPending } =
    useUpdateDistanceBasedDeliveryFee();

  const handleSubmit = async (values: UpdateDistanceDeliveryFeePayload) => {
    try {
      await updateDistanceDeliveryFee({
        ...values,
        is_active: distanceFeeActive,
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
      validationSchema={distanceBaseFeeSchema}
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
                    checked={distanceFeeActive}
                    onCheckedChange={setDistanceFeeActive}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppInput
                  disabled={isPending}
                  label={t('baseFeeLabel')}
                  name="base_distance_fee"
                  type="number"
                />

                <AppInput
                  label={t('distanceGreaterThanLabel')}
                  name="distance_greater_than"
                  type="number"
                  step="0.5"
                  helperText={t('distanceStepHint')}
                  disabled={isPending}
                />

                <AppInput
                  disabled={isPending}
                  label={t('perKmChargesLabel')}
                  name="per_km_charges"
                  type="number"
                />
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {t('calculationHint')}
              </p>

              <div className="flex justify-end mt-4">
                <AppButton
                  type="submit"
                  className="px-14 bg-primary text-white"
                  isLoading={isLoading || isPending || isSubmitting}
                  disabled={isLoading || isPending || isSubmitting}
                >
                  {hasExistingDistanceFee
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
