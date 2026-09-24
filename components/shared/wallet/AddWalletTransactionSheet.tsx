'use client';

import { useMemo } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse, WalletOwnerType } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { useCreateWalletTransaction } from '@/hooks/api/super-admin/enatega-deliveries/wallets';
import { handleApiError } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import {
  walletTransactionSchema,
  WalletTransactionFormValues,
} from '@/schemas/enatega-deliveries/wallet/wallet-transaction.schema';
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
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface AddWalletTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerType: WalletOwnerType;
  ownerId: string;
  balance: number;
}

const initialValues: WalletTransactionFormValues = {
  description: '',
  amount: '',
};

export function AddWalletTransactionSheet({
  open,
  onOpenChange,
  ownerType,
  ownerId,
  balance,
}: AddWalletTransactionSheetProps) {
  const t = useTranslations('wallet.form');
  const tSchema = useTranslations('');
  const { formatCurrency, currencyCode } = useCurrency();
  const { mutateAsync: createTransaction } = useCreateWalletTransaction();

  const validationSchema = useMemo(
    () =>
      walletTransactionSchema(tSchema, {
        balance,
        formattedBalance: formatCurrency(balance),
      }),
    [tSchema, balance, formatCurrency],
  );

  const handleSubmit = async (
    values: WalletTransactionFormValues,
    { resetForm }: FormikHelpers<WalletTransactionFormValues>,
  ) => {
    try {
      await createTransaction({
        ownerType,
        ownerId,
        description: values.description.trim(),
        amount: Number(values.amount),
      });
      toast.success(t('success'));
      resetForm();
      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, resetForm }) => {
            const amount = values.amount === '' ? NaN : Number(values.amount);
            const hasAmount = Number.isFinite(amount) && amount !== 0;
            const isCredit = hasAmount && amount > 0;
            const isDebit = hasAmount && amount < 0;

            return (
              <Form className="flex flex-col h-full" noValidate>
                <SheetHeader>
                  <SheetTitle>{t('title')}</SheetTitle>
                  <SheetDescription>{t('description')}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <div className="space-y-6">
                    <AppTextarea
                      name="description"
                      label={t('descriptionLabel')}
                      placeholder={t('descriptionPlaceholder')}
                      helperText={t('descriptionHelper')}
                      rows={4}
                      maxLength={500}
                      requiredAsterisk
                    />

                    <div className="space-y-2">
                      <AppInputField
                        name="amount"
                        label={t('amountLabel')}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder={t('amountPlaceholder')}
                        helperText={t('amountHelper')}
                        postfix={
                          <span className="text-sm text-muted-foreground">
                            {currencyCode}
                          </span>
                        }
                        postfixClassName="!right-3"
                        className={cn(
                          '!pr-14 font-semibold tabular-nums',
                          isCredit && 'text-help-green',
                          isDebit && 'text-help-red',
                        )}
                        requiredAsterisk
                      />

                      {hasAmount && (
                        <div
                          aria-live="polite"
                          className={cn(
                            'rounded-xl border px-3 py-2.5 text-sm',
                            isCredit
                              ? 'border-help-green/30 bg-help-green/5 text-help-green'
                              : 'border-help-red/30 bg-help-red/5 text-help-red',
                          )}
                        >
                          <p className="font-medium">
                            {isCredit
                              ? t('creditPreview', {
                                  amount: formatCurrency(amount),
                                })
                              : t('debitPreview', {
                                  amount: formatCurrency(Math.abs(amount)),
                                })}
                          </p>
                          <p className="text-mute">
                            {t('balanceAfterPreview', {
                              amount: formatCurrency(balance + amount),
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <SheetFooter className="border-t flex-row justify-end">
                  <AppButton
                    variant="mute"
                    type="button"
                    onClick={() => {
                      resetForm();
                      onOpenChange(false);
                    }}
                    disabled={isSubmitting}
                  >
                    {t('cancel')}
                  </AppButton>
                  <AppButton
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {t('submit')}
                  </AppButton>
                </SheetFooter>
              </Form>
            );
          }}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
