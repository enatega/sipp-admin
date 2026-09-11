import * as Yup from 'yup';

type SchemaTranslator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getStep1Schema = (t: SchemaTranslator) =>
  Yup.object().shape({
    couponName: Yup.string().required(t('couponNameRequired')),
    couponCode: Yup.string().required(t('couponCodeRequired')),
    couponDescription: Yup.string().required(t('couponDescriptionRequired')),
  });

export const getStep2Schema = (t: SchemaTranslator) =>
  Yup.object().shape({
    discountType: Yup.string()
      .oneOf(['PERCENTAGE', 'FIXED'], t('discountTypeInvalid'))
      .required(t('discountTypeRequired')),

    discountValue: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      )
      .typeError(t('discountValueMustBeNumber'))
      .positive(t('discountValueGreaterThanZero'))
      .required(t('discountValueRequired')),

    minOrderValue: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      )
      .nullable()
      .typeError(t('minOrderValueMustBeNumber'))
      .min(0, t('minOrderValueCannotBeNegative'))
      .required(t('minOrderValueRequired')),

    totalUsageLimit: Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      )
      .nullable()
      .typeError(t('totalUsageLimitMustBeNumber'))
      .integer(t('totalUsageLimitMustBeInteger'))
      .min(1, t('totalUsageLimitAtLeastOne'))
      .required(t('totalUsageLimitRequired')),
  });

export const getStep3Schema = (t: SchemaTranslator, isStoreCoupons: boolean) =>
  isStoreCoupons
    ? Yup.object().shape({
        products: Yup.array()
          .of(Yup.string())
          .min(1, t('atLeastOneProduct'))
          .required(t('productsRequired')),
        usagePerUser: Yup.number()
          .typeError(t('usagePerUserMustBeNumber'))
          .integer(t('usagePerUserMustBeInteger'))
          .min(1, t('usagePerUserAtLeastOne'))
          .max(100, t('usagePerUserMaxHundred'))
          .required(t('usagePerUserRequired')),
      })
    : Yup.object().shape({
        stores: Yup.array()
          .of(Yup.string())
          .min(1, t('atLeastOneStore'))
          .required(t('storesRequired')),
        usagePerUser: Yup.number()
          .typeError(t('usagePerUserMustBeNumber'))
          .integer(t('usagePerUserMustBeInteger'))
          .min(1, t('usagePerUserAtLeastOne'))
          .max(100, t('usagePerUserMaxHundred'))
          .required(t('usagePerUserRequired')),
      });

export const getStep4Schema = (t: SchemaTranslator) =>
  Yup.object().shape({
    activeImmediately: Yup.boolean().oneOf([true, false], t('statusRequired')),
    startDate: Yup.date().when('activeImmediately', {
      is: false,
      then: (schema) =>
        schema.typeError(t('startDateRequired')).required(t('startDateRequired')),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    endDate: Yup.date()
      .typeError(t('endDateRequired'))
      .required(t('endDateRequired'))
      .test('is-after-start', t('endDateAfterStartDate'), function (value) {
        const { activeImmediately, startDate } = this.parent;
        if (activeImmediately) {
          // If active immediately, start_date is sent as now + 1 min,
          // so end_date must be at least after that.
          return value ? value > new Date(Date.now() + 1 * 60 * 1000) : true;
        }
        return value && startDate ? value > new Date(startDate) : true;
      }),
  });

export const getStep5Schema = (t: SchemaTranslator) =>
  Yup.object().shape({
    paymentMethod: Yup.array()
      .of(Yup.string().oneOf(['COD', 'CARD']))
      .min(1, t('atLeastOnePaymentMethod'))
      .required(t('paymentMethodRequired')),

    deliveryType: Yup.array()
      .of(Yup.string().oneOf(['ALL', 'PICKUP', 'DELIVERY']))
      .min(1, t('atLeastOneDeliveryType'))
      .required(t('deliveryTypeRequired')),

    forNewUserOnly: Yup.boolean().required(t('forNewUserOnlyRequired')),
    forPremiumShopOnly: Yup.boolean().required(t('forPremiumShopOnlyRequired')),
    premiumShop: Yup.string(),
  });

export const getEditCouponSchema = (
  t: SchemaTranslator,
  isStoreCoupons: boolean,
) =>
  Yup.object().shape({
    ...getStep1Schema(t).fields,
    ...getStep2Schema(t).fields,
    ...getStep3Schema(t, isStoreCoupons).fields,
    ...getStep4Schema(t).fields,
    ...getStep5Schema(t).fields,
  });
