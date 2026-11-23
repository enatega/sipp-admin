import * as Yup from 'yup';

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

type Translator = (key: string) => string;

export function editShopTypeSchema(t?: Translator) {
  const translate = (key: string, fallback: string) => (t ? t(key) : fallback);

  return Yup.object({
    name: Yup.string().required(translate('nameRequired', 'Name is required')),

    image: Yup.mixed<File | string>()
      .required(translate('iconRequired', 'Icon is required'))
      .test(
        'filesize',
        translate('fileSizeMax5Mb', 'File size must be less than 5MB'),
        (value) => {
          // allow existing image URL/string during edit
          if (!value) return false;

          if (typeof value === 'string') return true;

          return value.size <= MAX_FILE_SIZE;
        },
      ),

    description: Yup.string().required(
      translate('descriptionRequired', 'Description is required'),
    ),

    is_active: Yup.boolean(),
  });
}
