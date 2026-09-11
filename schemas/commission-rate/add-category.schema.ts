import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const addCategorySchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    zone: Yup.array()
      .of(Yup.string())
      .min(1, t('Schemas.addCategory.atLeastOneZoneRequired'))
      .required(t('Schemas.addCategory.zoneRequired')),
    category: Yup.string().required(t('Schemas.addCategory.categoryRequired')),
    commissions: Yup.array().of(
      Yup.object().shape({
        rideTypeCommission: Yup.number()
          .required(t('Schemas.addCategory.commissionRequired'))
          .min(0, t('Schemas.addCategory.commissionNonNegative')),
      }),
    ),
  });
