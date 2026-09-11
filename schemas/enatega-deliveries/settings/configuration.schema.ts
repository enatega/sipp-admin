import * as Yup from 'yup';

export const configurationSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    currencyCode: Yup.string()
      .trim()
      .required(t('currencyCodeRequired'))
      .max(10, t('currencyCodeMax')),
    currencySymbol: Yup.string()
      .trim()
      .required(t('currencySymbolRequired'))
      .max(10, t('currencySymbolMax')),
  });

export interface ConfigurationFormValues {
  currencyCode: string;
  currencySymbol: string;
}
