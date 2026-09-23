import * as Yup from 'yup';

type Translator = (key: string) => string;

export const editZoneCommissionSchema = (t?: Translator) => {
  const translate = (key: string, fallback: string) => (t ? t(key) : fallback);

  return Yup.object().shape({
    zone: Yup.string().required(translate('zoneRequired', 'Zone is required')),
    commissionRate: Yup.number()
      .transform((value, originalValue) => {
        if (
          originalValue === '' ||
          originalValue === 'N/A' ||
          originalValue == null
        )
          return undefined;
        return value;
      })
      .typeError(
        translate(
          'commissionRateMustBeNumber',
          'Commission rate must be a number',
        ),
      )
      .required(
        translate('commissionRateRequired', 'Commission rate is required'),
      )
      .min(
        0,
        translate(
          'commissionRateNonNegative',
          'Commission rate must be non-negative',
        ),
      )
      .max(
        100,
        translate('commissionRateMax100', 'Commission rate cannot exceed 100%'),
      ),
  });
};
