import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

export const updateStorePasswordSchema = (
  t: ReturnType<typeof useTranslations>,
  tPassword: ReturnType<typeof useTranslations>,
) => Yup.object({
  password: Yup.string()
    .required(t('passwordRequired'))
    .min(8, t('passwordMinLength'))
    .max(72, tPassword('passwordMaxLength'))
    .matches(/[A-Z]/, t('passwordUppercase'))
    .matches(/[0-9]/, t('passwordNumber'))
    .matches(/[^A-Za-z0-9]/, t('passwordSpecial')),
  confirmPassword: Yup.string()
    .required(tPassword('confirmRequired'))
    .oneOf([Yup.ref('password')], tPassword('mismatch')),
});
