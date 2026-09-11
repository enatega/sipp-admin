import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
  return String(value ?? '').replace(/\D/g, '').length;
};

const createFileValidator = (t: ReturnType<typeof useTranslations>) =>
  Yup.mixed()
    .test('fileType', t('fileTypeAllowed'), (file: unknown) => {
      if (!file) return true;
      return IMAGE_TYPES.includes((file as File).type);
    })
    .test(
      'fileSize',
      t('fileSizeAllowed', { maxMb: MAX_MB }),
      (file: unknown) => {
        if (!file) return true;
        return (file as File).size <= MAX_BYTES;
      },
    );

const createFileOrUrlValidator = (t: ReturnType<typeof useTranslations>) =>
  Yup.mixed()
    .test('fileType', t('fileTypeAllowed'), (value: unknown) => {
      if (!value) return true;
      if (typeof value === 'string') return true;
      if (value instanceof File) return IMAGE_TYPES.includes(value.type);
      return false;
    })
    .test(
      'fileSize',
      t('fileSizeAllowed', { maxMb: MAX_MB }),
      (value: unknown) => {
        if (!value) return true;
        if (typeof value === 'string') return true;
        if (value instanceof File) return value.size <= MAX_BYTES;
        return false;
      },
    );

const createRequiredFileOrUrlValidator = (t: ReturnType<typeof useTranslations>) =>
  createFileOrUrlValidator(t).test(
    'requiredFileOrUrl',
    t('documentRequired'),
    (value: unknown) => {
      if (!value) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return value instanceof File;
    },
  );

type LatLngPoint = { latitude: number; longitude: number };
type ZoneShape = {
  type: 'circle' | 'polygon' | 'polyline' | 'marker' | null;
  center?: { lat: number; lng: number };
  radius?: number;
  path?: { lat: number; lng: number }[];
} | null;

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const isPointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]) => {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
};

const isExactLocationInsideZone = (
  exactLocation: LatLngPoint | null | undefined,
  zone: ZoneShape,
) => {
  if (!exactLocation || !zone || !zone.type) return true;

  const point = { lat: exactLocation.latitude, lng: exactLocation.longitude };

  if (zone.type === 'circle' && zone.center && zone.radius) {
    return distanceMeters(point, zone.center) <= zone.radius;
  }

  if (zone.type === 'polygon' && Array.isArray(zone.path) && zone.path.length >= 3) {
    return isPointInPolygon(point, zone.path);
  }

  if (zone.type === 'marker' && zone.center) {
    return distanceMeters(point, zone.center) <= 100;
  }

  if (zone.type === 'polyline' && Array.isArray(zone.path) && zone.path.length > 0) {
    const minDistance = zone.path.reduce((min, p) => {
      return Math.min(min, distanceMeters(point, p));
    }, Number.POSITIVE_INFINITY);

    return minDistance <= 100;
  }

  return false;
};

export const StoreFormStep1Schema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('nameRequired'))
      .min(2, t('nameMinLength'))
      .max(100, t('nameMaxLength')),

    vendorId: Yup.string().required(t('vendorRequired')),

    phone: Yup.string()
      .required(t('phoneRequired'))
      .min(10, t('phoneMinLength'))
      .test('phoneMaxDigits', t('phoneMinLength'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),

    logo: Yup.mixed<File>()
      .required(t('logoRequired'))
      .test('fileType', t('fileTypeAllowed'), (file) =>
        !!file && IMAGE_TYPES.includes(file.type)
      )
      .test('fileSize', t('fileSizeAllowed', { maxMb: MAX_MB }), (file) =>
        !!file && file.size <= MAX_BYTES
      ),

    banner: Yup.mixed<File>()
      .nullable()
      .test('fileType', t('fileTypeAllowed'), (file) =>
        !file || IMAGE_TYPES.includes(file.type)
      )
      .test('fileSize', t('fileSizeAllowed', { maxMb: MAX_MB }), (file) =>
        !file || file.size <= MAX_BYTES
      ),

    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmailAddress')),

    password: Yup.string()
      .required(t('passwordRequired'))
      .min(8, t('passwordMinLength'))
      .matches(/[A-Z]/, t('passwordUppercase'))
      .matches(/[0-9]/, t('passwordNumber'))
      .matches(/[^A-Za-z0-9]/, t('passwordSpecial')),

    zoneId: Yup.string().required(t('zoneRequired')),

    minimumOrderValue: Yup.string().required(t('minimumOrderRequired')),

    tagLine: Yup.string()
      .max(150, t('tagLineMaxLength')),

    description: Yup.string()
      .max(500, t('descriptionMaxLength')),

    address: Yup.string()
      .required(t('addressRequired'))
      .min(10, t('addressMinLength'))
      .max(500, t('addressMaxLength')),
  });

export const VendorStoreFormStep1Schema = (
  t: ReturnType<typeof useTranslations>,
) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('nameRequired'))
      .min(2, t('nameMinLength'))
      .max(100, t('nameMaxLength')),

    phone: Yup.string()
      .required(t('phoneRequired'))
      .min(10, t('phoneMinLength'))
      .test('phoneMaxDigits', t('phoneMinLength'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),

    logo: Yup.mixed<File>()
      .required(t('logoRequired'))
      .test('fileType', t('fileTypeAllowed'), (file) =>
        !!file && IMAGE_TYPES.includes(file.type)
      )
      .test('fileSize', t('fileSizeAllowed', { maxMb: MAX_MB }), (file) =>
        !!file && file.size <= MAX_BYTES
      ),

    banner: Yup.mixed<File>()
      .nullable()
      .test('fileType', t('fileTypeAllowed'), (file) =>
        !file || IMAGE_TYPES.includes(file.type)
      )
      .test('fileSize', t('fileSizeAllowed', { maxMb: MAX_MB }), (file) =>
        !file || file.size <= MAX_BYTES
      ),

    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmailAddress')),

    password: Yup.string()
      .required(t('passwordRequired'))
      .min(8, t('passwordMinLength'))
      .matches(/[A-Z]/, t('passwordUppercase'))
      .matches(/[0-9]/, t('passwordNumber'))
      .matches(/[^A-Za-z0-9]/, t('passwordSpecial')),

    zoneId: Yup.string().required(t('zoneRequired')),

    minimumOrderValue: Yup.string().required(t('minimumOrderRequired')),

    tagLine: Yup.string()
      .max(150, t('tagLineMaxLength')),

    description: Yup.string()
      .max(500, t('descriptionMaxLength')),

    address: Yup.string()
      .required(t('addressRequired'))
      .min(10, t('addressMinLength'))
      .max(500, t('addressMaxLength')),
  });

export const StoreFormStep2Schema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    shopType: Yup.string().when('otherShopType', {
      is: (val: string) => !val || val.trim() === '',
      then: (schema) => schema.required(t('shopTypeRequired')),
      otherwise: (schema) => schema,
    }),
  });

export const StoreFormStep3Schema = (
  t: ReturnType<typeof useTranslations>,
) => {

  return Yup.object().shape({
    prepareTime: Yup.string().required(t('prepareTimeRequired')),
    scheduleBooking: Yup.boolean(),
    pickupAllowed: Yup.boolean(),
    deliveryAllowed: Yup.boolean(),
    packingCharges: Yup.string().required(t('packingChargesRequired')),
    baseFee: Yup.string().required(t('baseFeeRequired')),
    perKmFee: Yup.string().required(t('perKmFeeRequired')),
    freeDeliveryThreshold: Yup.string().required(t('freeDeliveryThresholdRequired')),
  });

};

export const StoreFormStep4Schema = (
  t: ReturnType<typeof useTranslations>,
) => {
  return Yup.object()
    .shape({
      location: Yup.mixed().required(t('locationRequired')),
      exactStoreLocation: Yup.object({
        latitude: Yup.number().required(t('exactStoreLocationRequired')),
        longitude: Yup.number().required(t('exactStoreLocationRequired')),
      })
        .nullable()
        .required(t('exactStoreLocationRequired')),
      storeTimings: Yup.object(),
    })
    .test(
      'exact-location-within-delivery-bounds',
      t('exactStoreLocationOutsideBounds'),
      (value) => {
        const formValue = value as unknown as
          | { exactStoreLocation?: LatLngPoint | null; location?: ZoneShape }
          | undefined;
        return isExactLocationInsideZone(
          formValue?.exactStoreLocation,
          formValue?.location ?? null,
        );
      },
    );
};

export const Step5Schema = (t: ReturnType<typeof useTranslations>) => {
  const fileValidator = createFileValidator(t);

  const baseSchema = {
    businessLicenseFront: fileValidator.required(t('businessLicenseFrontRequired')),
    businessLicenseBack: fileValidator.required(t('businessLicenseBackRequired')),
    identityCardFront: fileValidator.required(t('identityCardFrontRequired')),
    identityCardBack: fileValidator.required(t('identityCardBackRequired')),
    storeRegistrationDoc: fileValidator.required(t('storeRegistrationDocRequired')),
    taxCertificate: fileValidator.required(t('taxCertificateRequired')),
  }
  return Yup.object().shape(baseSchema);
};


export const step6Schema = (t: ReturnType<typeof useTranslations>) => {

  return Yup.object().shape({

    bankName: Yup.string().required(t('bankNameRequired')),
    accountHolderName: Yup.string().required(t('accountHolderNameRequired')),
    accountNumber: Yup.string()
      .trim() // remove leading/trailing spaces
      .required(t('accountNumberRequired'))
      .test(
        'is-valid-account-or-iban',
        t('accountNumberOrIbanInvalid'),
        (value) => {
          if (!value) return false;

          // 1️⃣ Plain account number: digits only (8–20 digits)
          const accountNumberRegex = /^\d{8,20}$/;

          // 2️⃣ IBAN: 2 letters + 2 digits + alphanumeric (simplified)
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/i;

          return accountNumberRegex.test(value) || ibanRegex.test(value)
        }
      ),
    branchCode: Yup.string().optional(),
  })
}

export const editStoreFormSchema = (t: ReturnType<typeof useTranslations>) => {
  const fileOrUrlValidator = createFileOrUrlValidator(t);
  const requiredFileOrUrlValidator = createRequiredFileOrUrlValidator(t);

  const commonFields = {
    name: Yup.string()
      .required(t('nameRequired'))
      .min(2, t('nameMinLength'))
      .max(100, t('nameMaxLength')),

    vendorId: Yup.string().optional(),

    phone: Yup.string()
      .required(t('phoneRequired'))
      .min(10, t('phoneMinLength'))
      .test('phoneMaxDigits', t('phoneMinLength'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),

    logo: fileOrUrlValidator.nullable(),

    banner: fileOrUrlValidator.nullable(),

    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmailAddress')),

    zoneId: Yup.string().required(t('zoneRequired')),

    minimumOrderValue: Yup.string().optional(),

    tagLine: Yup.string()
      .nullable()
      .max(150, t('tagLineMaxLength')),

    description: Yup.string()
      .nullable()
      .max(500, t('descriptionMaxLength')),

    address: Yup.string()
      .required(t('addressRequired'))
      .min(10, t('addressMinLength'))
      .max(500, t('addressMaxLength')),

    shopType: Yup.string().required(t('shopTypeRequired')),

    storeType: Yup.string().optional(),

    // Store timings - optional, defaults will be handled
    storeTimings: Yup.mixed().optional(),

    // Location - required
    location: Yup.mixed().required(t('locationRequired')),
    // exactStoreLocation: Yup.object({
    //   latitude: Yup.number().required(t('exactStoreLocationRequired')),
    //   longitude: Yup.number().required(t('exactStoreLocationRequired')),
    // })
    //   .nullable()
    //   .required(t('exactStoreLocationRequired')),

    // Password related fields - not editable
    password: Yup.string().optional(),
    autoGeneratePassword: Yup.boolean().optional(),
    changePassword: Yup.boolean().optional(),
    mailLoginCredentials: Yup.boolean().optional(),
  };

  // const step3Fields = {
  //   prepareTime: Yup.string().required(t('prepareTimeRequired')),
  //   pickupAllowed: Yup.boolean(),
  //   deliveryAllowed: Yup.boolean(),
  //   scheduleBooking: Yup.boolean(),
  //   freeDeliveryThreshold: Yup.string().required(t('freeDeliveryThresholdRequired')),
  //   packingCharges: Yup.string().required(t('packingChargesRequired')),
  //   baseFee: Yup.string().required(t('baseFeeRequired')),
  //   perKmFee: Yup.string().required(t('perKmFeeRequired')),
  // };

  const documentFields = {
    businessLicenseFront: requiredFileOrUrlValidator,
    businessLicenseBack: requiredFileOrUrlValidator,
    identityCardFront: requiredFileOrUrlValidator,
    identityCardBack: requiredFileOrUrlValidator,
    storeRegistrationDoc: requiredFileOrUrlValidator,
    taxCertificate: requiredFileOrUrlValidator,
  };

  const bankFields = {
    bankName: Yup.string().required(t('bankNameRequired')),
    accountHolderName: Yup.string().required(t('accountHolderNameRequired')),
    accountNumber: Yup.string()
      .trim()
      .required(t('accountNumberRequired'))
      .test(
        'is-valid-account-or-iban',
        t('accountNumberOrIbanInvalid'),
        (value) => {
          if (!value) return false;
          const accountNumberRegex = /^\d{8,20}$/;
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/i;
          return accountNumberRegex.test(value) || ibanRegex.test(value);
        }
      ),
    branchCode: Yup.string().optional(),
  };

  return Yup.object()
    .shape({
      ...commonFields,
      // ...step3Fields, // Store Operation Mode validation intentionally disabled for enatega-deliveries/stores.
      ...documentFields,
      ...bankFields,
    })
    .test(
      'exact-location-within-delivery-bounds',
      t('exactStoreLocationOutsideBounds'),
      (value) => {
        const formValue = value as unknown as
          | { exactStoreLocation?: LatLngPoint | null; location?: ZoneShape }
          | undefined;
        return isExactLocationInsideZone(
          formValue?.exactStoreLocation,
          formValue?.location ?? null,
        );
      },
    );
};
