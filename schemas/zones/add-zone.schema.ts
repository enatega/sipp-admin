import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const addZoneSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object({
    name: Yup.string().required(t('Schemas.addZone.nameRequired')),
    description: Yup.string(),
    selectedTypes: Yup.array().min(1, t('Schemas.addZone.atLeastOneTypeRequired')),
    zoneData: Yup.object().nullable(),
  });
