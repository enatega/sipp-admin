import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

// Customer Breakdown Schema
export const customerBreakdownSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    rangeFrom: Yup.number()
      .min(0, t('Schemas.customerLoyalty.rangeFromMin'))
      .required(t('Schemas.customerLoyalty.rangeFromRequired')),
    rangeTo: Yup.number()
      .min(1, t('Schemas.customerLoyalty.rangeToMin'))
      .required(t('Schemas.customerLoyalty.rangeToRequired'))
      .moreThan(
        Yup.ref('rangeFrom'),
        t('Schemas.customerLoyalty.rangeToGreaterThanFrom')
      ),
    // Labelled Percentage in the form, so the messages say so too.
    points: Yup.number()
      .typeError(t('Schemas.customerLoyalty.percentageRange'))
      .integer(t('Schemas.customerLoyalty.percentageWhole'))
      .min(1, t('Schemas.customerLoyalty.percentageRange'))
      .max(100, t('Schemas.customerLoyalty.percentageRange'))
      .required(t('Schemas.customerLoyalty.percentageRequired')),
  });

// Driver Breakdown Schema
export const driverBreakdownSchema = (t: ReturnType<typeof useTranslations>) =>
  Yup.object().shape({
    tierId: Yup.string().required(t('Schemas.customerLoyalty.tierRequired')),
    rideCount: Yup.number()
      .min(1, t('Schemas.customerLoyalty.rideCountMin'))
      .required(t('Schemas.customerLoyalty.rideCountRequired')),
    points: Yup.number()
      .min(1, t('Schemas.customerLoyalty.pointsMin'))
      .required(t('Schemas.customerLoyalty.pointsRequired')),
  });

// Type exports
export type CustomerBreakdownFormValues = Yup.InferType<
  ReturnType<typeof customerBreakdownSchema>
>;

export type DriverBreakdownFormValues = Yup.InferType<
  ReturnType<typeof driverBreakdownSchema>
>;
