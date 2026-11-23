import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

// Point Conversion Schema
export const pointConversionSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    pointsEqualsOne: Yup.number()
      .min(1, t('Schemas.customerLoyalty.pointsEqualsOneMin'))
      .required(t('Schemas.customerLoyalty.pointsEqualsOneRequired')),
  });

// Type export
export type PointConversionFormValues = Yup.InferType<
  ReturnType<typeof pointConversionSchema>
>;
