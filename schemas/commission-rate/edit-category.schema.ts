import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const editCategorySchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    commissions: Yup.array().of(
      Yup.object().shape({
        rideTypeCommission: Yup.number()
          .required(t('Schemas.editCategory.commissionRequired'))
          .min(0, t('Schemas.editCategory.commissionNonNegative')),
      }),
    ),
  });
