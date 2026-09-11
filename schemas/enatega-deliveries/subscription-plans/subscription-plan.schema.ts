import * as Yup from 'yup';

type Translator = (key: string) => string;

const toNumber = (value: unknown, originalValue: unknown) => {
  if (originalValue === '' || originalValue === null || originalValue === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? value : Number(value);
};

export const subscriptionPlanSchema = (t?: Translator) => {
  const tr = (key: string, fallback: string) => (t ? t(key) : fallback);

  return Yup.object({
    planName: Yup.string().trim().required(tr('planNameRequired', 'Plan name is required')),
    planDescription: Yup.string().trim().optional(),
    monthlyPrice: Yup.number()
      .transform(toNumber)
      .typeError(tr('monthlyPriceNumber', 'Monthly price must be a number'))
      .min(0, tr('monthlyPriceMin', 'Monthly price must be 0 or greater'))
      .required(tr('monthlyPriceRequired', 'Monthly price is required')),
    yearlyPrice: Yup.number()
      .transform(toNumber)
      .typeError(tr('yearlyPriceNumber', 'Yearly price must be a number'))
      .min(0, tr('yearlyPriceMin', 'Yearly price must be 0 or greater'))
      .required(tr('yearlyPriceRequired', 'Yearly price is required')),
    commissionRate: Yup.number()
      .transform(toNumber)
      .typeError(tr('commissionRateNumber', 'Commission rate must be a number'))
      .min(0, tr('commissionRateMin', 'Commission rate must be 0 or greater'))
      .max(100, tr('commissionRateMax', 'Commission rate cannot exceed 100'))
      .required(tr('commissionRateRequired', 'Commission rate is required')),
    freeOrdersIncluded: Yup.number()
      .transform(toNumber)
      .typeError(tr('freeOrdersNumber', 'Free orders must be a number'))
      .min(0, tr('freeOrdersMin', 'Free orders must be 0 or greater'))
      .integer(tr('freeOrdersInteger', 'Free orders must be a whole number'))
      .required(tr('freeOrdersRequired', 'Free orders is required')),
    bannerDuration: Yup.number()
      .transform(toNumber)
      .typeError(tr('bannerDurationNumber', 'Banner duration must be a number'))
      .min(0, tr('bannerDurationMin', 'Banner duration must be 0 or greater'))
      .integer(tr('bannerDurationInteger', 'Banner duration must be a whole number'))
      .required(tr('bannerDurationRequired', 'Banner duration is required')),
    numberOfOrders: Yup.number()
      .transform(toNumber)
      .when('isUnlimitedOrders', {
        is: false,
        then: (schema) =>
          schema
            .typeError(tr('numberOfOrdersNumber', 'Number of orders must be a number'))
            .min(1, tr('numberOfOrdersMin', 'Number of orders must be at least 1'))
            .integer(tr('numberOfOrdersInteger', 'Number of orders must be a whole number'))
            .required(tr('numberOfOrdersRequired', 'Number of orders is required')),
        otherwise: (schema) => schema.optional(),
      }),
    isActive: Yup.boolean().required(),
    isRecommended: Yup.boolean().required(),
    isUnlimitedOrders: Yup.boolean().required(),
    planFeatureIds: Yup.array()
      .of(Yup.string().required())
      .min(1, tr('featuresRequired', 'Select at least one feature'))
      .required(tr('featuresRequired', 'Select at least one feature')),
  });
};
