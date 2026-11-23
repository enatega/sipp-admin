import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

export const enableStoreLoginSchema = (
  t: ReturnType<typeof useTranslations>,
) => Yup.object({
  email: Yup.string().trim().required(t('emailRequired')).email(t('invalidEmailAddress')),
  password: Yup.string()
    .required(t('passwordRequired'))
    .min(8, t('passwordMinLength'))
    .matches(/[A-Z]/, t('passwordUppercase'))
    .matches(/[0-9]/, t('passwordNumber'))
    .matches(/[^A-Za-z0-9]/, t('passwordSpecial')),
});
