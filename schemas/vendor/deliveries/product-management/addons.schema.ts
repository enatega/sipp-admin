import * as Yup from 'yup';

type TranslationValues = Record<string, string | number | Date>;
type Translator = (key: string, values?: TranslationValues) => string;

export const addonFormValidationSchema = (t: Translator) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('validation.nameRequired')),
    description: Yup.string().optional(),
    requiredCheck: Yup.boolean().required(t('validation.requiredCheckRequired')),
    selectionType: Yup.string()
      .oneOf(['single', 'multi'], t('validation.selectionTypeInvalid'))
      .required(t('validation.selectionTypeRequired')),
    price: Yup.number()
      .typeError(t('validation.priceNumber'))
      .min(0, t('validation.priceMin'))
      .required(t('validation.priceRequired')),
    minSelect: Yup.number()
      .typeError(t('validation.minSelectNumber'))
      .min(0, t('validation.minSelectMin'))
      .required(t('validation.minSelectRequired')),
    maxSelect: Yup.number()
      .typeError(t('validation.maxSelectNumber'))
      .min(0, t('validation.maxSelectMin'))
      .required(t('validation.maxSelectRequired'))
      .test(
        'max-gte-min',
        t('validation.maxSelectLessThanMin'),
        function maxGteMin(value) {
          const minSelect = Number(this.parent.minSelect);
          if (!Number.isFinite(minSelect) || !Number.isFinite(Number(value))) {
            return true;
          }
          return Number(value) >= minSelect;
        },
      ),
    optionIds: Yup.array()
      .of(Yup.string().required())
      .min(1, t('validation.optionIdsRequired'))
      .required(t('validation.optionIdsRequired')),
    dependsOnVariationId: Yup.string().optional(),
    status: Yup.boolean().required(),
  });
