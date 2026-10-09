import * as Yup from 'yup';

type TranslationFn = (key: string) => string;

const emptyToUndefined = (value: unknown, original: unknown) =>
  original === '' || original === null ? undefined : value;

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
    // Multi-select limits; blank means no limit (sent as 0).
    minSelect: Yup.number()
      .transform(emptyToUndefined)
      .typeError(t('validation.minSelectNumber'))
      .integer(t('validation.minSelectNumber'))
      .min(0, t('validation.minSelectMin'))
      .optional(),
    maxSelect: Yup.number()
      .transform(emptyToUndefined)
      .typeError(t('validation.maxSelectNumber'))
      .integer(t('validation.maxSelectNumber'))
      .min(0, t('validation.maxSelectMin'))
      .optional()
      .test(
        'max-not-below-min',
        t('validation.maxSelectLessThanMin'),
        function (maxSelect) {
          const minSelect = Number(this.parent.minSelect || 0);
          if (minSelect === 0) return true;
          // The API treats 0 as "no max" but still rejects min > max.
          return maxSelect !== undefined && maxSelect >= minSelect;
        },
      ),
  });
