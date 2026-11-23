import * as Yup from 'yup';

export const createSubCategorySchema = (t: (key: string) => string) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('Schemas.subCategory.nameRequired'))
      .min(2, t('Schemas.subCategory.nameMinLength'))
      .max(50, t('Schemas.subCategory.nameMaxLength')),
    categoryId: Yup.string()
      .required(t('Schemas.subCategory.categoryRequired')),
    image: Yup.mixed()
      .nullable()
      .optional()
      .test('fileType', t('Schemas.subCategory.invalidFileType'), (value) => {
        if (!value) return true;
        const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedTypes.includes((value as File).type);
      })
      .test('fileSize', t('Schemas.subCategory.imageTooLarge'), (value) => {
        if (!value) return true;
        return (value as File).size <= 5 * 1024 * 1024; // 5MB
      }),
  });

export const updateSubCategorySchema = (t: (key: string) => string) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('Schemas.subCategory.nameRequired'))
      .min(2, t('Schemas.subCategory.nameMinLength'))
      .max(50, t('Schemas.subCategory.nameMaxLength')),
    categoryId: Yup.string()
      .required(t('Schemas.subCategory.categoryRequired')),
    image: Yup.mixed()
      .nullable()
      .optional()
      .test('fileType', t('Schemas.subCategory.invalidFileType'), (value) => {
        if (!value) return true;
        if (typeof value === 'string') return true; // existing image URL
        const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedTypes.includes((value as File).type);
      })
      .test('fileSize', t('Schemas.subCategory.imageTooLarge'), (value) => {
        if (!value || typeof value === 'string') return true;
        return (value as File).size <= 5 * 1024 * 1024;
      }),
  });
