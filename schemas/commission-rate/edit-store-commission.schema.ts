import * as Yup from 'yup';

type Translator = (key: string) => string;

export const editStoreCommissionSchema = (t?: Translator) => {
  const translate = (key: string, fallback: string) => (t ? t(key) : fallback);

  return Yup.object().shape({
    storeName: Yup.string().required(
      translate('storeRequired', 'Store is required'),
    ),
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
    commissionVatRate: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue == null ? undefined : value,
      )
      .typeError(
        translate(
          'commissionVatRateMustBeNumber',
          'Commission VAT rate must be a number',
        ),
      )
      .required(
        translate(
          'commissionVatRateRequired',
          'Commission VAT rate is required',
        ),
      )
      .min(
        0,
        translate(
          'commissionVatRateNonNegative',
          'Commission VAT rate must be non-negative',
        ),
      )
      .max(
        100,
        translate(
          'commissionVatRateMax100',
          'Commission VAT rate cannot exceed 100%',
        ),
      ),
  });
};
