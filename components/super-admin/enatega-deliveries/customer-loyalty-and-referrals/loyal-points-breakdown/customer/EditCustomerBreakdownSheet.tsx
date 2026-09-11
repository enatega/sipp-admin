'use client';

import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useUpdateLoyaltyPointsRange } from '@/hooks/api/super-admin/enatega-deliveries/loyalty-points-range';
import { handleApiError } from '@/lib/toast-error';
import { customerBreakdownSchema } from '@/schemas/customer-loyalty-and-referrals/breakdown.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { CustomerBreakdown, CustomerBreakdownFormValues } from '../../types';

interface EditCustomerBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CustomerBreakdown | null;
}

const EditCustomerBreakdownSheet = ({
  open,
  onOpenChange,
  item,
}: EditCustomerBreakdownSheetProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.loyalPointsBreakdown');
  const tSchema = useTranslations('');

  const { mutateAsync: updateRange } = useUpdateLoyaltyPointsRange();

  const initialValues = useMemo<CustomerBreakdownFormValues>(
    () => ({
      rangeFrom: item?.rangeFrom || 0,
      rangeTo: item?.rangeTo || 0,
      points: item?.points || 0,
    }),
    [item]
  );

  const handleSubmit = async (
    values: CustomerBreakdownFormValues,
    { setSubmitting }: FormikHelpers<CustomerBreakdownFormValues>
  ) => {
    if (!item) return;

    try {
      await updateRange({
        id: item.id,
        payload: {
          from: values.rangeFrom,
          to: values.rangeTo,
          points: values.points,
        },
      });
      toast.success(t('toast.updateSuccess'));
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
          validationSchema={customerBreakdownSchema(tSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('editSheet.title')}</SheetTitle>
                <SheetDescription>{t('editSheet.description')}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-6">
                  <AppInputField
                    name="rangeFrom"
                    label={t('form.rangeFromLabel')}
                    type="number"
                    placeholder={t('form.rangeFromPlaceholder')}
                    min="0"
                    requiredAsterisk
                  />

                  <AppInputField
                    name="rangeTo"
                    label={t('form.rangeToLabel')}
                    type="number"
                    placeholder={t('form.rangeToPlaceholder')}
                    min="1"
                    requiredAsterisk
                  />

                  <AppInputField
                    name="points"
                    label={t('form.percentageLabel')}
                    type="number"
                    placeholder={t('form.percentagePlaceholder')}
                    min="1"
                    postfix={
                      <span className="text-sm text-muted-foreground">%</span>
                    }
                    requiredAsterisk
                  />
                </div>
              </div>

              <SheetFooter className="border-t">
                <AppButton
                  variant="mute"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('form.cancelButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {t('form.updateButton')}
                </AppButton>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export { EditCustomerBreakdownSheet };

