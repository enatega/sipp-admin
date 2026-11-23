import * as Yup from 'yup';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const AddStaticPageSchema = Yup.object({
    page_name: Yup.string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(120, 'Title cannot exceed 120 characters'),

    content: Yup.string()
        .test('not-empty-html', 'Content is required', (value) => {
            if (!value) return false;
            const stripped = value.replace(/<[^>]*>/g, '').trim();
            return stripped.length > 0;
        })
        .required('Content is required'),

    is_published: Yup.boolean().required(),

    banner_image: Yup.mixed<File>()
        .required('Banner image is required')
        .test('fileSize', 'Banner image must be less than 5MB', (value) => {
            if (!value) return false;
            if (!(value instanceof File)) return false;
            return value.size <= MAX_FILE_SIZE;
        }),
});

export const EditStaticPageSchema = Yup.object({
    page_name: Yup.string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(120, 'Title cannot exceed 120 characters')
        .optional(),

    slug: Yup.string()
        .trim()
        .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase and can contain hyphens only',
        )
        .min(3, 'Slug must be at least 3 characters')
        .max(100, 'Slug cannot exceed 100 characters')
        .optional(),

    content: Yup.string()
        .test('not-empty-html', 'Content is required', (value) => {
            if (!value) return true;
            const stripped = value.replace(/<[^>]*>/g, '').trim();
            return stripped.length > 0;
        })
        .optional(),

    is_published: Yup.boolean().optional(),

    banner_image: Yup.mixed<File>()
        .optional()
        .test('fileSize', 'Banner image must be less than 5MB', (value) => {
            if (!value) return true;
            if (!(value instanceof File)) return false;
            return value.size <= MAX_FILE_SIZE;
        }),
});