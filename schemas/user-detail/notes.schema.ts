import * as yup from 'yup';
import { useTranslations } from 'next-intl';

export const notesSchema = (t: ReturnType<typeof useTranslations>) =>
  yup.object().shape({
    notes: yup.string().required(t('Schemas.notes.notesRequired')),
  });
