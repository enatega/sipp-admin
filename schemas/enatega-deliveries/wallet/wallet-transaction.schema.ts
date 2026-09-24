import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const WALLET_TRANSACTION_MAX_AMOUNT = 1_000_000;

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

export const walletTransactionSchema = (
  t: ReturnType<typeof useTranslations>,
  options: { balance: number; formattedBalance: string },
) =>
  Yup.object().shape({
    description: Yup.string()
      .trim()
      .required(t('wallet.validation.descriptionRequired'))
      .min(3, t('wallet.validation.descriptionMin'))
      .max(500, t('wallet.validation.descriptionMax')),
    amount: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue === null ? undefined : value,
      )
      .typeError(t('wallet.validation.amountInvalid'))
      .required(t('wallet.validation.amountRequired'))
      .notOneOf([0], t('wallet.validation.amountNonZero'))
      .min(-WALLET_TRANSACTION_MAX_AMOUNT, t('wallet.validation.amountRange'))
      .max(WALLET_TRANSACTION_MAX_AMOUNT, t('wallet.validation.amountRange'))
      .test(
        'two-decimals',
        t('wallet.validation.amountDecimals'),
        (value) => value === undefined || hasAtMostTwoDecimals(value),
      )
      .test(
        'sufficient-balance',
        t('wallet.validation.insufficientBalance', {
          amount: options.formattedBalance,
        }),
        (value) => value === undefined || value > 0 || options.balance + value >= 0,
      ),
  });

export type WalletTransactionFormValues = {
  description: string;
  amount: number | '';
};
