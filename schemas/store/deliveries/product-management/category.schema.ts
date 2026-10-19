import * as Yup from 'yup';

const CATEGORY_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const categoryScheduleShape = (t: (key: string) => string) => ({
  scheduleAvailability: Yup.boolean().required(),
  availableFrom: Yup.string().when('scheduleAvailability', {
    is: true,
    then: (schema) =>
      schema
        .required(t('Schemas.category.availableFromRequired'))
        .matches(CATEGORY_TIME_PATTERN, t('Schemas.category.invalidTime')),
  }),
  availableTo: Yup.string().when('scheduleAvailability', {
    is: true,
    then: (schema) =>
      schema
        .required(t('Schemas.category.availableToRequired'))
        .matches(CATEGORY_TIME_PATTERN, t('Schemas.category.invalidTime'))
        .notOneOf(
          [Yup.ref('availableFrom')],
          t('Schemas.category.timesMustDiffer'),
        ),
  }),
});

export const createCategorySchema = (t: (key: string) => string) =>
  Yup.object().shape({
    ...categoryScheduleShape(t),
    name: Yup.string()
      .required(t('Schemas.category.nameRequired'))
      .min(2, t('Schemas.category.nameMinLength'))
      .max(50, t('Schemas.category.nameMaxLength')),
    image: Yup.mixed()
      .required(t('Schemas.category.imageRequired'))
      .test('fileType', t('Schemas.category.invalidFileType'), (value) => {
        if (!value) return true;
        const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedTypes.includes((value as File).type);
      })
      .test('fileSize', t('Schemas.category.imageTooLarge'), (value) => {
        if (!value) return true;
        return (value as File).size <= 5 * 1024 * 1024; // 5MB
      }),
  });

export const updateCategorySchema = (t: (key: string) => string) =>
  Yup.object().shape({
    ...categoryScheduleShape(t),
    name: Yup.string()
      .required(t('Schemas.category.nameRequired'))
      .min(2, t('Schemas.category.nameMinLength'))
      .max(50, t('Schemas.category.nameMaxLength')),
    image: Yup.mixed()
      .nullable()
      .optional()
      .test('fileType', t('Schemas.category.invalidFileType'), (value) => {
        if (!value) return true;
        if (typeof value === 'string') return true; // existing image URL
        const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedTypes.includes((value as File).type);
      })
      .test('fileSize', t('Schemas.category.imageTooLarge'), (value) => {
        if (!value || typeof value === 'string') return true;
        return (value as File).size <= 5 * 1024 * 1024;
      }),
  });
