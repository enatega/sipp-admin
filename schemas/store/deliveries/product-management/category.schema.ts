import * as Yup from 'yup';

export const createCategorySchema = (t: (key: string) => string) =>
  Yup.object().shape({
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
