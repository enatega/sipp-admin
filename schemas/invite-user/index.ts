import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const inviteUserValidationSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    fullName: Yup.string()
      .required(t('Schemas.inviteUser.fullNameRequired'))
      .min(2, t('Schemas.inviteUser.fullNameMinLength')),
    email: Yup.string()
      .required(t('Schemas.inviteUser.emailRequired'))
      .email(t('Schemas.inviteUser.invalidEmailAddress')),
    password: Yup.string()
      .required(t('Schemas.inviteUser.passwordRequired'))
      .min(8, t('Schemas.inviteUser.passwordMinLength'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        t('Schemas.inviteUser.passwordRequirements'),
      ),
    role: Yup.string().optional(),
    mustChangePassword: Yup.boolean(),
  });

export type InviteUserFormValues = Yup.InferType<ReturnType<typeof inviteUserValidationSchema>>;
