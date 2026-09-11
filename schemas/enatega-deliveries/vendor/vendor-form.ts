import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
    return String(value ?? '').replace(/\D/g, '').length;
};

const createRequiredImageFile = (t: ReturnType<typeof useTranslations>) =>
  Yup.mixed<File>()
    .required(t('Schemas.vendorForm.imageRequired'))
    .test(
      'fileType',
      t('Schemas.vendorForm.fileTypeAllowed'),
      (file) => !!file && file instanceof File && IMAGE_TYPES.includes(file.type),
    )
    .test(
      'fileSize',
      t('Schemas.vendorForm.fileSizeAllowed', { maxMb: MAX_MB }),
      (file) => !!file && file instanceof File && file.size <= MAX_BYTES,
    );

const createRequiredImageFileOrUrl = (t: ReturnType<typeof useTranslations>) =>
  Yup.mixed<File | string>()
    .required(t('Schemas.vendorForm.imageRequired'))
    .test(
      'fileType',
      t('Schemas.vendorForm.fileTypeAllowed'),
      (value) => {
        if (!value) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (value instanceof File) return IMAGE_TYPES.includes(value.type);
        return false;
      },
    )
    .test(
      'fileSize',
      t('Schemas.vendorForm.fileSizeAllowed', { maxMb: MAX_MB }),
      (value) => {
        if (!value) return false;
        if (typeof value === 'string') return true;
        if (value instanceof File) return value.size <= MAX_BYTES;
        return false;
      },
    );

export const VendorFormStep1Schema = (
  t: ReturnType<typeof useTranslations>,
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, t('Schemas.vendorForm.nameMinLength'))
      .max(50, t('Schemas.vendorForm.nameMaxLength'))
      .required(t('Schemas.vendorForm.nameRequired')),

    email: Yup.string()
      .trim()
      .email(t('Schemas.vendorForm.invalidEmailAddress'))
      .required(t('Schemas.vendorForm.emailRequired')),

    phone: Yup.string()
      .matches(/^[0-9+\-\s()]{7,20}$/, t('Schemas.vendorForm.phoneInvalid'))
      .test(
        'phoneMaxDigits',
        t('Schemas.vendorForm.phoneInvalid'),
        (value) => getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      )
      .required(t('Schemas.vendorForm.phoneRequired')),

    password: Yup.string()
      .min(8, t('Schemas.vendorForm.passwordMinLength'))
      .matches(/[A-Z]/, t('Schemas.vendorForm.passwordUppercase'))
      .matches(/[a-z]/, t('Schemas.vendorForm.passwordLowercase'))
      .matches(/[0-9]/, t('Schemas.vendorForm.passwordNumber'))
      .matches(/[@$!%*?&#]/, t('Schemas.vendorForm.passwordSpecial'))
      .required(t('Schemas.vendorForm.passwordRequired')),

    zone_id: Yup.string().required(t('Schemas.vendorForm.zoneRequired')),

    autoGeneratePassword: Yup.boolean(),
    mailLoginCredentials: Yup.boolean(),
    changePasswordAllowed: Yup.boolean(),
  });

// STEP 2 Schema
export const VendorFormStep2Schema = (
  t: ReturnType<typeof useTranslations>,
) =>
  Yup.object().shape({
    logo: createRequiredImageFile(t).required(
      t('Schemas.vendorForm.businessTrademarkRequired'),
    ),
    business_license_front: createRequiredImageFile(t).required(
      t('Schemas.vendorForm.businessLicenseFrontRequired'),
    ),
    business_license_back: createRequiredImageFile(t).required(
      t('Schemas.vendorForm.businessLicenseBackRequired'),
    ),
    national_id_passport_front: createRequiredImageFile(t).required(
      t('Schemas.vendorForm.nationalIdPassportFrontRequired'),
    ),
    national_id_passport_back: createRequiredImageFile(t).required(
      t('Schemas.vendorForm.nationalIdPassportBackRequired'),
    ),
  });

export const VendorFormStep3Schema = (
  t: ReturnType<typeof useTranslations>,
) =>
  Yup.object().shape({
    bank_name: Yup.string().trim().required(t('Schemas.vendorForm.bankNameRequired')),

    branch_code: Yup.string()
      .trim()
      .required(t('Schemas.vendorForm.branchCodeRequired')),

    account_title: Yup.string()
      .trim()
      .required(t('Schemas.vendorForm.accountTitleRequired')),

    account_number: Yup.string()
      .trim()
      .required(t('Schemas.vendorForm.accountNumberRequired'))
      .matches(/^[0-9]+$/, t('Schemas.vendorForm.accountNumberDigitsOnly'))
      .min(6, t('Schemas.vendorForm.accountNumberTooShort'))
      .max(30, t('Schemas.vendorForm.accountNumberTooLong')),

    accepted_terms_and_privacy: Yup.boolean().oneOf(
      [true],
      t('Schemas.vendorForm.acceptedTermsRequired'),
    ),
  });

export const EditVendorFormSchema = (
  t: ReturnType<typeof useTranslations>,
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, t('Schemas.vendorForm.nameMinLength'))
      .max(50, t('Schemas.vendorForm.nameMaxLength'))
      .required(t('Schemas.vendorForm.nameRequired')),

    email: Yup.string()
      .trim()
      .email(t('Schemas.vendorForm.invalidEmailAddress'))
      .required(t('Schemas.vendorForm.emailRequired')),

    phone: Yup.string()
      .matches(/^[0-9+\-\s()]{7,20}$/, t('Schemas.vendorForm.phoneInvalid'))
      .test(
        'phoneMaxDigits',
        t('Schemas.vendorForm.phoneInvalid'),
        (value) => getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      )
      .required(t('Schemas.vendorForm.phoneRequired')),

    zone_id: Yup.string().required(t('Schemas.vendorForm.zoneRequired')),

    logo: createRequiredImageFileOrUrl(t).required(
      t('Schemas.vendorForm.businessTrademarkRequired'),
    ),
    business_license_front: createRequiredImageFileOrUrl(t).required(
      t('Schemas.vendorForm.businessLicenseFrontRequired'),
    ),
    business_license_back: createRequiredImageFileOrUrl(t).required(
      t('Schemas.vendorForm.businessLicenseBackRequired'),
    ),
    national_id_passport_front: createRequiredImageFileOrUrl(t).required(
      t('Schemas.vendorForm.nationalIdPassportFrontRequired'),
    ),
    national_id_passport_back: createRequiredImageFileOrUrl(t).required(
      t('Schemas.vendorForm.nationalIdPassportBackRequired'),
    ),
  });

export interface EditVendorFormValues {
    name: string;
    email: string;
    phone: string;
    zone_id: string;

    logo: File | string | null;
    business_license_front: File | string | null;
    business_license_back: File | string | null;
    national_id_passport_front: File | string | null;
    national_id_passport_back: File | string | null;
}
