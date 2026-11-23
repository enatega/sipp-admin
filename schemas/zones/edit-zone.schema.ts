import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

export const editZoneSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object({
    name: Yup.string().required(t('Schemas.editZone.nameRequired')),
    description: Yup.string(),
    selectedTypes: Yup.array().min(1, t('Schemas.editZone.atLeastOneTypeRequired')),
    zoneData: Yup.object().nullable(),
  });