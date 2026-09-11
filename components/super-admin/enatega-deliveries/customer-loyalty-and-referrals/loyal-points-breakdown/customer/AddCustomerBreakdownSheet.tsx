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
import { useCreateLoyaltyPointsRange } from '@/hooks/api/super-admin/enatega-deliveries/loyalty-points-range';
import { handleApiError } from '@/lib/toast-error';
import { customerBreakdownSchema } from '@/schemas/customer-loyalty-and-referrals/breakdown.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { CustomerBreakdownFormValues } from '../../types';

interface AddCustomerBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialValues: CustomerBreakdownFormValues = {
  rangeFrom: 0,
  rangeTo: 0,
  points: 0,
};

const AddCustomerBreakdownSheet = ({
  open,
  onOpenChange,
}: AddCustomerBreakdownSheetProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.loyalPointsBreakdown');
  const tSchema = useTranslations('');

  const { mutateAsync: createRange } = useCreateLoyaltyPointsRange();

  const handleSubmit = async (
    values: CustomerBreakdownFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CustomerBreakdownFormValues>
  ) => {
    try {
      await createRange({
        from: values.rangeFrom,
        to: values.rangeTo,
        points: values.points,
      });
      toast.success(t('toast.createSuccess'));
      resetForm();
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
          {({ isSubmitting, resetForm }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('addSheet.title')}</SheetTitle>
                <SheetDescription>{t('addSheet.description')}</SheetDescription>
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
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                  disabled={isSubmitting}
                >
                  {t('form.cancelButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {t('form.addButton')}
                </AppButton>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export { AddCustomerBreakdownSheet };

