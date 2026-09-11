'use client';

import { useTranslations } from 'next-intl';
import { Form, Formik, FormikHelpers } from 'formik';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppButton } from '@/components/shared/AppButton';
import { referralRuleSchema } from '@/schemas/customer-loyalty-and-referrals/referral-rule.schema';
import { ReferralRuleFormValues } from '../types';

interface CreateRuleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: ReferralRuleFormValues) => void;
}

const initialValues: ReferralRuleFormValues = {
  triggerEvent: '',
  points: 0,
};

const CreateRuleSheet = ({
  open,
  onOpenChange,
  onSave,
}: CreateRuleSheetProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.referralRules');
  const tSchema = useTranslations('');

  const handleSubmit = async (
    values: ReferralRuleFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReferralRuleFormValues>
  ) => {
    try {
      onSave({
        triggerEvent: values.triggerEvent.trim(),
        points: values.points,
      });
      resetForm();
      onOpenChange(false);
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
          {({ isSubmitting, resetForm }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('createSheet.title')}</SheetTitle>
                <SheetDescription>{t('createSheet.description')}</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-6">
                  <AppInputField
                    name="triggerEvent"
                    label={t('form.triggerEventLabel')}
                    type="text"
                    placeholder={t('form.triggerEventPlaceholder')}
                    helperText={t('form.triggerEventHelper')}
                    requiredAsterisk
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
                  {t('form.createButton')}
                </AppButton>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export { CreateRuleSheet };
