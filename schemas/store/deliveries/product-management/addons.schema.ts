import * as Yup from 'yup';

type TranslationFn = (key: string) => string;

export const addonFormValidationSchema = (t: TranslationFn) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('validation.nameRequired')),
    description: Yup.string().optional(),
    requiredCheck: Yup.boolean().required(t('validation.requiredCheckRequired')),
    selectionType: Yup.string()
      .oneOf(['single', 'multi'], t('validation.selectionTypeInvalid'))
      .required(t('validation.selectionTypeRequired')),
    optionIds: Yup.array()
      .of(Yup.string().required())
      .min(1, t('validation.optionIdsRequired'))
      .required(t('validation.optionIdsRequired')),
  });
