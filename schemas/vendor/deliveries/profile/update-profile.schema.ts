import * as Yup from 'yup';

type TranslateFunction = (key: string) => string;
const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
  return String(value ?? '').replace(/\D/g, '').length;
};

export const createUpdateProfileValidationSchema = (t: TranslateFunction) =>
  Yup.object().shape({
    vendorName: Yup.string().required(t('vendorNameRequired')),
    email: Yup.string()
      .email(t('emailInvalid'))
      .required(t('emailRequired')),
    phone: Yup.string()
      .required(t('phoneRequired'))
      .test('phoneMaxDigits', t('phoneRequired'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),
    city: Yup.string().required(t('cityRequired')),
    notes: Yup.string(),
    businessLicenseFront: Yup.mixed().nullable(),
    businessLicenseBack: Yup.mixed().nullable(),
    nationalIdFront: Yup.mixed().nullable(),
    nationalIdBack: Yup.mixed().nullable(),
  });
