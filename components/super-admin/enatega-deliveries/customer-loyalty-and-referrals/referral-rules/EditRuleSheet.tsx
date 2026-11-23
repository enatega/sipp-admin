'use client';

import { useMemo } from 'react';
import { referralRuleSchema } from '@/schemas/customer-loyalty-and-referrals/referral-rule.schema';
import { ApiErrorResponse } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
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
  ReferralRule,
  ReferralRuleFormValues,
  UpdateReferralPointsPayload,
  UpdateReferralPointsResponse,
} from '../types';

interface EditRuleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: ReferralRule | null;
  updateMutation: UseMutationResult<
    UpdateReferralPointsResponse,
    ApiErrorResponse,
    { id: string; payload: UpdateReferralPointsPayload }
  >;
}

const EditRuleSheet = ({
  open,
  onOpenChange,
  rule,
  updateMutation,
}: EditRuleSheetProps) => {
  const t = useTranslations(
    'deliveriesCustomerLoyaltyAndReferrals.referralRules',
  );
  const tSchema = useTranslations('');

  const initialValues = useMemo<ReferralRuleFormValues>(
    () => ({
      triggerEvent: rule?.triggerEvent || 'On Signup',
      points: rule?.points || 0,
    }),
    [rule],
  );

  const handleSubmit = async (
    values: ReferralRuleFormValues,
    { setSubmitting }: FormikHelpers<ReferralRuleFormValues>,
  ) => {
    if (!rule) return;

    try {
      await updateMutation.mutateAsync({
        id: rule.id,
        payload: { points: values.points },
      });
      toast.success(t('editSheet.successMessage'));
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
          validationSchema={referralRuleSchema(tSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('editSheet.title')}</SheetTitle>
                <SheetDescription>
                  {t('editSheet.description')}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-6">
                  <AppInputField
                    name="triggerEvent"
                    label={t('form.triggerEventLabel')}
                    type="text"
                    placeholder={t('form.triggerEventPlaceholder')}
                    helperText={t('form.triggerEventHelper')}
                    disabled
                  />

                  <AppInputField
                    name="points"
                    label={t('form.pointsLabel')}
                    type="number"
                    placeholder={t('form.pointsPlaceholder')}
                    min="1"
                    helperText={t('form.pointsHelper')}
                    postfix={
                      <span className="text-sm text-muted-foreground">
                        {t('points')}
                      </span>
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

export { EditRuleSheet };
