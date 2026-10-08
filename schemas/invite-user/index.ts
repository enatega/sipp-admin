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
    role: Yup.string().required(t('Schemas.inviteUser.roleRequired')),
  });

export type InviteUserFormValues = Yup.InferType<ReturnType<typeof inviteUserValidationSchema>>;
