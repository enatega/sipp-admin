import * as Yup from 'yup';

type TranslationValues = Record<string, string | number | Date>;
type Translator = (key: string, values?: TranslationValues) => string;

export const addOptionValidationSchema = (
  t: Translator,
) =>
  Yup.object().shape({
    title: Yup.string().required(t('titleRequired')),
    description: Yup.string().required(t('descriptionRequired')),
    stockQuantity: Yup.number()
      .typeError(t('stockQuantityNumber'))
      .min(0, t('stockQuantityMin'))
      .required(t('stockQuantityRequired')),
    price: Yup.number()
      .typeError(t('priceNumber'))
      .min(0, t('priceMin'))
      .required(t('priceRequired')),
  });
