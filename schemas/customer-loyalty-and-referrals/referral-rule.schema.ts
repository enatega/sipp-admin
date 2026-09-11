import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

// Referral Rule Schema
export const referralRuleSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    triggerEvent: Yup.string()
      .trim()
      .required(t('Schemas.customerLoyalty.triggerEventRequired')),
    points: Yup.number()
      .min(1, t('Schemas.customerLoyalty.pointsMin'))
      .required(t('Schemas.customerLoyalty.pointsRequired')),
  });

// Type export
export type ReferralRuleFormValues = Yup.InferType<
  ReturnType<typeof referralRuleSchema>
>;
