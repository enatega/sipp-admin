import * as Yup from 'yup';

type TSchema = (key: string) => string;

export const storePaymentsValidationSchema = (t: TSchema) =>
  Yup.object().shape({
    bankName: Yup.string().required(t('bankNameRequired')),
    accountHolderName: Yup.string().required(t('accountHolderNameRequired')),
    accountNumberIban: Yup.string().required(t('accountNumberIbanRequired')),
    branchCode: Yup.string(),
  });
