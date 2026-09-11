import * as Yup from 'yup';

type TSchema = (key: string) => string;
const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
  return String(value ?? '').replace(/\D/g, '').length;
};

export const updateProfileValidationSchema = (t: TSchema) =>
  Yup.object().shape({
    storeName: Yup.string().required(t('storeNameRequired')),
    vendorId: Yup.string().required(t('vendorIdRequired')),
    email: Yup.string().email(t('emailInvalid')).required(t('emailRequired')),
    supportPhone: Yup.string()
      .required(t('supportPhoneRequired'))
      .test('phoneMaxDigits', t('supportPhoneRequired'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),
    zoneId: Yup.string().required(t('zoneIdRequired')),
    tagLine: Yup.string().required(t('tagLineRequired')),
    description: Yup.string(),
    minimumOrderValue: Yup.string().required(t('minimumOrderValueRequired')),
    notes: Yup.string(),
    businessLicenseFront: Yup.mixed().nullable(),
    businessLicenseBack: Yup.mixed().nullable(),
    nationalIdFront: Yup.mixed().nullable(),
    nationalIdBack: Yup.mixed().nullable(),
    storeRegistrationDocument: Yup.mixed().nullable(),
    taxCertificate: Yup.mixed().nullable(),
  });
