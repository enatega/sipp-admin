import * as Yup from 'yup';

type SchemaTranslator = (key: string) => string;

const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;

export const dealFormValidationSchema = (t: SchemaTranslator) =>
  Yup.object({
    dealName: Yup.string().trim().required(t('dealNameRequired')),
    product: Yup.string().trim().required(t('productRequired')),
    variation: Yup.string().trim().nullable().notRequired(),
    discountType: Yup.string()
      .oneOf([...DISCOUNT_TYPES])
      .required(t('discountTypeRequired')),
    discountValue: Yup.number()
      .typeError(t('discountValueRequired'))
      .min(0, t('discountValueMin'))
      .required(t('discountValueRequired')),
    startDate: Yup.string().required(t('startDateRequired')),
    endDate: Yup.string()
      .required(t('endDateRequired'))
      .test(
        'end-date-after-start',
        t('endDateAfterStartDate'),
        function validateEndDate(value) {
          const { startDate } = this.parent as { startDate?: string };
          if (!startDate || !value) return true;
          return new Date(value) >= new Date(startDate);
        },
      ),
    status: Yup.boolean().required(),
  });
