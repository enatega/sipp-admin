import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

interface CreateWithdrawalRequestSchemaParams {
  t: ReturnType<typeof useTranslations>;
  showStoreSelection: boolean;
  isStoreSelected: boolean;
  isBankDetailsReady: boolean;
  maxWithdrawalAmount: number;
  currencySymbol: string;
}

export const createWithdrawalRequestSchema = ({
  t,
  showStoreSelection,
  isStoreSelected,
  isBankDetailsReady,
  maxWithdrawalAmount,
  currencySymbol,
}: CreateWithdrawalRequestSchemaParams) =>
  Yup.object({
    storeId: showStoreSelection
      ? Yup.string()
          .required(t('validation.storeRequired'))
          .test(
            'bank-details-available',
            t('validation.bankDetailsUnavailable'),
            () => !isStoreSelected || isBankDetailsReady,
          )
      : Yup.string().optional(),
    amount: Yup.number()
      .min(1, t('validation.amountMin'))
      .max(
        maxWithdrawalAmount,
        t('validation.amountMax', {
          currencySymbol,
          maxAmount: maxWithdrawalAmount,
        }),
      )
      .required(t('validation.amountRequired')),
    notes: Yup.string().optional(),
  });
