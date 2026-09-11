import * as Yup from 'yup';

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const addonGroupValidationSchema = (t: TranslationFn) =>
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

export const variationGroupValidationSchema = (
  t: TranslationFn,
  options?: { requireImage?: boolean },
) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('errors.nameRequired')),
    price: Yup.number()
      .typeError(t('errors.priceRequired'))
      .moreThan(0, t('errors.priceRequired'))
      .required(t('errors.priceRequired')),
    image: Yup.mixed<File | string>()
      .nullable()
      .test('required-image', t('errors.imageRequired'), (value) => {
        if (!options?.requireImage) return true;
        return value instanceof File;
      }),
  });
