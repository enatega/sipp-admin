import * as yup from 'yup';

const hasValue = (value: unknown) =>
  (typeof value === 'string' && value.trim().length > 0) ||
  value instanceof File;

export const bannerSchema = (requireMedia: boolean) =>
  yup
    .object()
    .shape({
      title: yup.string().trim().required('Banner title is required'),
      description: yup.string().trim().required('Description is required'),
      action_type: yup
        .mixed<'none' | 'store' | 'product' | 'shop_type'>()
        .oneOf(['none', 'store', 'product', 'shop_type'])
        .required('Action type is required'),
      related_store: yup.string().when('action_type', {
        is: 'store',
        then: (schema) => schema.required('Store is required'),
        otherwise: (schema) => schema.optional(),
      }),
      related_product: yup.string().when('action_type', {
        is: 'product',
        then: (schema) => schema.required('Product is required'),
        otherwise: (schema) => schema.optional(),
      }),
      related_shop_type: yup.string().when('action_type', {
        is: 'shop_type',
        then: (schema) => schema.required('Shop type is required'),
        otherwise: (schema) => schema.optional(),
      }),
      image: yup.mixed<File | string>().nullable(),
      video: yup.mixed<File | string>().nullable(),
    })
    .test(
      'single-media',
      'Please upload either an image or a video, not both',
      (value) => !(hasValue(value?.image) && hasValue(value?.video)),
    )
    .test(
      'required-media',
      'Please upload an image or a video',
      (value) =>
        !requireMedia || hasValue(value?.image) || hasValue(value?.video),
    );
