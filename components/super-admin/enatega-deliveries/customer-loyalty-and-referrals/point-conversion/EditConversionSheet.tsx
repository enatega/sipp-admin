'use client';

import { useMemo } from 'react';
import { pointConversionSchema } from '@/schemas/customer-loyalty-and-referrals/point-conversion.schema';
import { ApiErrorResponse } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCurrency } from '@/hooks/use-currency';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import {
  PointsToBalanceResponse,
  UpdatePointsToBalancePayload,
} from '../types';

interface PointConversionFormValues {
  pointsEqualsOne: number;
}

interface EditConversionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointsEqualsOne: number;
  updateMutation: UseMutationResult<
    PointsToBalanceResponse,
    ApiErrorResponse,
    UpdatePointsToBalancePayload
  >;
}

// Preview component that uses Formik context
const ConversionPreview = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.editConversion');
  const { currencyCode } = useCurrency();
  const { values } = useFormikContext<PointConversionFormValues>();

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-accent/50 rounded-lg border">
      <span className="font-semibold">
        {values.pointsEqualsOne || '0'} {t('points')}
      </span>
      <ArrowRight className="size-4 text-muted-foreground" />
      <span className="font-semibold text-primary">{currencyCode} 1.00</span>
    </div>
  );
};

// Example calculation component that uses Formik context
const ExampleCalculation = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.editConversion');
  const { currencyCode } = useCurrency();
  const { values } = useFormikContext<PointConversionFormValues>();

  const pointsValue = values.pointsEqualsOne || 0;

  return (
    <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
      <h4 className="text-sm font-medium">{t('exampleTitle')}</h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          {t('exampleLine1', {
            points: pointsValue.toString(),
            currency: currencyCode,
            reward: '1.00',
          })}
        </p>
        <p>
          {t('exampleLine2', {
            points: (pointsValue * 2).toString(),
            currency: currencyCode,
            reward: '2.00',
          })}
        </p>
      </div>
    </div>
  );
};

const EditConversionSheet = ({
  open,
  onOpenChange,
  pointsEqualsOne,
  updateMutation,
}: EditConversionSheetProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.editConversion');
  const tSchema = useTranslations('');

  const initialValues = useMemo<PointConversionFormValues>(
    () => ({
      pointsEqualsOne,
    }),
    [pointsEqualsOne],
  );

  const handleSubmit = async (
    values: PointConversionFormValues,
    { setSubmitting }: FormikHelpers<PointConversionFormValues>,
  ) => {
    try {
      await updateMutation.mutateAsync({
        points: values.pointsEqualsOne,
      });
      toast.success(t('successMessage'));
      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <Formik
          initialValues={initialValues}
          validationSchema={pointConversionSchema(tSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('title')}</SheetTitle>
                <SheetDescription>{t('description')}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-6">
                  <ConversionPreview />

                  <AppInputField
                    name="pointsEqualsOne"
                    label={t('pointsEqualsOneLabel')}
                    type="number"
                    placeholder={t('pointsEqualsOnePlaceholder')}
                    min="1"
                    helperText={t('pointsEqualsOneHelper')}
                    requiredAsterisk
                  />

                  <ExampleCalculation />
                </div>
              </div>

              <SheetFooter className="border-t">
                <AppButton
                  variant="mute"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('cancelButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {t('saveButton')}
                </AppButton>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export default EditConversionSheet;
