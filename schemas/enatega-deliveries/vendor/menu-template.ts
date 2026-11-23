import * as Yup from 'yup';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

type TranslationFn = (key: string) => string;

type MenuValidationOptions = {
  imageRequired?: boolean;
};

export const createMenuValidationSchema = (
  t: TranslationFn,
  options: MenuValidationOptions = {},
) =>
  Yup.object().shape({
    title: Yup.string().required(t('titleRequired')),
    description: Yup.string().required(t('descriptionRequired')),
    stores: Yup.array()
      .of(Yup.string())
      .min(1, t('selectAtLeastOneStore'))
      .required(t('storeSelectionRequired')),
    image: Yup.mixed<File>()
      .nullable()
      .test('fileRequired', t('imageRequired'), (file) => {
        if (!options.imageRequired) {
          return true;
        }

        return !!file;
      })
      .test('fileType', t('fileType'), (file) => {
        if (!file) return !options.imageRequired;
        return IMAGE_TYPES.includes(file.type);
      })
      .test('fileSize', t('fileSize'), (file) => {
        if (!file) return !options.imageRequired;
        return file.size <= MAX_BYTES;
      }),
    isAvailable: Yup.boolean(),
  });
