import * as Yup from 'yup';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const imageFile = Yup.mixed<File | string>()
  .nullable()
  .test('fileType', 'Invalid file type. Only PNG, JPG, and WebP are allowed', (file) =>
    !file || typeof file === 'string' || IMAGE_TYPES.includes(file.type)
  )
  .test('fileSize', `Image size must be less than ${MAX_MB}MB`, (file) =>
    !file || typeof file === 'string' || file.size <= MAX_BYTES
  );

const imagesArray = Yup.array()
  .of(imageFile)
  .nullable();

export const productFormStep1Schema = (t: (key: string) => string) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('products.Schemas.product.nameRequired'))
      .min(2, t('products.Schemas.product.nameMinLength'))
      .max(100, t('products.Schemas.product.nameMaxLength')),
    categoryId: Yup.string().required(t('products.Schemas.product.categoryRequired')),
    subcategoryId: Yup.string().optional(),
    price: Yup.number()
      .required(t('products.Schemas.product.priceRequired'))
      .positive(t('products.Schemas.product.priceInvalid'))
      .typeError(t('products.Schemas.product.priceRequired')),
    stockQuantity: Yup.number()
      .required(t('products.Schemas.product.stockQuantityRequired'))
      .min(0, t('products.Schemas.product.stockQuantityMin'))
      .typeError(t('products.Schemas.product.stockQuantityRequired')),
    addOnIds: Yup.array().of(Yup.string()).optional(),
    dealId: Yup.string().optional(),
    unitOfMeasure: Yup.string().optional(),
    description: Yup.string().optional(),
    image: imageFile.nullable(),
    images: imagesArray,
  }).test(
    'at-least-one-image',
    t('products.Schemas.product.imageRequired'),
    (value) => {
      if (!value) return false;

      const galleryImages = Array.isArray(value.images)
        ? value.images.filter(Boolean)
        : [];

      return galleryImages.length > 0 || Boolean(value.image);
    },
  );
