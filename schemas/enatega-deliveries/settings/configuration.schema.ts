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
    usdConversionRate: Yup.number()
      .typeError(t('usdConversionRateNumber'))
      .required(t('usdConversionRateRequired'))
      .moreThan(0, t('usdConversionRatePositive'))
      .max(1_000_000_000, t('usdConversionRateMax')),
  });

export interface ConfigurationFormValues {
  currencyCode: string;
  currencySymbol: string;
  usdConversionRate: number | string;
}
