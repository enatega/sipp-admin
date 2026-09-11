'use client';

import { useEffect, useMemo } from 'react';
import { ApiErrorResponse, StaticPage } from '@/types';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import {
  useCreateStaticPage,
  useUpdateStaticPage,
} from '@/hooks/api/super-admin/enatega-deliveries/static-pages';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';
import EditableDocumentField from '@/components/shared/form/EditableDocumentFIeld';
import RichTextEditor from '@/components/shared/text-editor/AppRichEditor';

interface staticPageForm {
  onClose: () => void;
  setPreviewData: (data: StaticPage) => void;
  initialData?: Partial<StaticPage>;
  isEdit?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface DefaultContentText {
  heading: string;
  intro: string;
  sectionTitle: string;
  introduction: string;
  information: string;
  policies: string;
  contact: string;
  tipsTitle: string;
  tipsDescription: string;
}

const createDefaultContent = (
  content: DefaultContentText,
) => `<h2><strong>${content.heading}</strong></h2>
<p>${content.intro}</p>
<br/>
<h3>${content.sectionTitle}</h3>
<ul>
  <li>${content.introduction}</li>
  <li>${content.information}</li>
  <li>${content.policies}</li>
  <li>${content.contact}</li>
</ul>
<br/>
<h3>${content.tipsTitle}</h3>
<p>${content.tipsDescription}</p>`;

function FormikPreviewSync({
  setPreviewData,
}: {
  setPreviewData: staticPageForm['setPreviewData'];
}) {
  const { values } = useFormikContext<StaticPage>();

  useEffect(() => {
    setPreviewData(values);
  }, [values, setPreviewData]);

  return null;
}

export function StaticPageForm({
  onClose,
  setPreviewData,
  initialData,
  isEdit = false,
}: staticPageForm) {
  const tDefaultContent = useTranslations(
    'settings.staticPages.form.defaultContent',
  );
  const tValidation = useTranslations('settings.staticPages.form.validation');
  const tToasts = useTranslations('settings.staticPages.form.toasts');
  const tErrors = useTranslations('settings.staticPages.form.errors');
  const tPageTitle = useTranslations(
    'settings.staticPages.form.fields.pageTitle',
  );
  const tSlug = useTranslations('settings.staticPages.form.fields.slug');
  const tContent = useTranslations('settings.staticPages.form.fields.content');
  const tBanner = useTranslations('settings.staticPages.form.fields.banner');
  const tPublish = useTranslations('settings.staticPages.form.publish');
  const tButtons = useTranslations('settings.staticPages.form.buttons');
  const tDefaultPoints = useTranslations(
    'settings.staticPages.form.defaultContent.points',
  );
  const defaultContent = useMemo(
    () =>
      createDefaultContent({
        heading: tDefaultContent('heading'),
        intro: tDefaultContent('intro'),
        sectionTitle: tDefaultContent('sectionTitle'),
        introduction: tDefaultPoints('introduction'),
        information: tDefaultPoints('information'),
        policies: tDefaultPoints('policies'),
        contact: tDefaultPoints('contact'),
        tipsTitle: tDefaultContent('tipsTitle'),
        tipsDescription: tDefaultContent('tipsDescription'),
      }),
    [tDefaultContent, tDefaultPoints],
  );
  const defaultValues: StaticPage = {
    id: '',
    page_name: '',
    slug: '',
    banner_image: '',
    content: defaultContent,
    is_published: false,
  };
  const initialValues: StaticPage = {
    ...defaultValues,
    ...initialData,
  };
  const addStaticPageSchema = useMemo(
    () =>
      Yup.object({
        page_name: Yup.string()
          .trim()
          .min(3, tValidation('titleMin'))
          .max(120, tValidation('titleMax')),
        content: Yup.string()
          .test('not-empty-html', tValidation('contentRequired'), (value) => {
            if (!value) return false;
            const stripped = value.replace(/<[^>]*>/g, '').trim();
            return stripped.length > 0;
          })
          .required(tValidation('contentRequired')),
        is_published: Yup.boolean().required(),
        banner_image: Yup.mixed<File>()
          .required(tValidation('bannerRequired'))
          .test('fileSize', tValidation('bannerMaxSize'), (value) => {
            if (!value) return false;
            if (!(value instanceof File)) return false;
            return value.size <= MAX_FILE_SIZE;
          }),
      }),
    [tValidation],
  );
  const editStaticPageSchema = useMemo(
    () =>
      Yup.object({
        page_name: Yup.string()
          .trim()
          .min(3, tValidation('titleMin'))
          .max(120, tValidation('titleMax'))
          .optional(),

        slug: Yup.string()
          .trim()
          .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, tValidation('slugFormat'))
          .min(3, tValidation('slugMin'))
          .max(100, tValidation('slugMax'))
          .optional(),

        content: Yup.string()
          .test('not-empty-html', tValidation('contentRequired'), (value) => {
            if (!value) return true;

            const stripped = value.replace(/<[^>]*>/g, '').trim();
            return stripped.length > 0;
          })
          .optional(),

        is_published: Yup.boolean().optional(),

        banner_image: Yup.mixed<File | string>()
          .optional()
          .test('fileSize', tValidation('bannerMaxSize'), (value) => {
            // existing image/url → skip validation
            if (!value || typeof value === 'string') return true;

            // validate only newly uploaded file
            if (value instanceof File) {
              return value.size <= MAX_FILE_SIZE;
            }

            return true;
          }),
      }),
    [tValidation],
  );

  // API Hooks
  const { mutateAsync: createStaticPage, isPending } = useCreateStaticPage();
  const { mutateAsync: updateStaticPage, isPending: isUpdatePagePending } =
    useUpdateStaticPage();

  // Handles
  const handleCreatePage = async (values: StaticPage) => {
    try {
      const payload = {
        page_name: values.page_name,
        slug: values.slug,
        content: values.content,
        banner_image: values.banner_image,
        is_published: values.is_published,
      };
      await createStaticPage(payload);
      toast.success(tToasts('createSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      onClose();
    }
  };

  const handleUpdatePage = async (
    values: Partial<StaticPage> & { id: string },
  ) => {
    try {
      // Prepare payload
      if (!initialData?.id) {
        throw new Error(tErrors('missingId'));
      }

      const payload: Partial<StaticPage> & { id: string } = {
        id: initialData.id,
      };

      if (values.page_name !== undefined) payload.page_name = values.page_name;
      if (values.slug !== undefined) payload.slug = values.slug;
      if (values.content !== undefined) payload.content = values.content;
      if (values.is_published !== undefined)
        payload.is_published = values.is_published;
      if (values.banner_image) payload.banner_image = values.banner_image;

      // Call mutation
      await updateStaticPage(payload);

      toast.success(tToasts('updateSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      onClose();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isEdit ? editStaticPageSchema : addStaticPageSchema}
      onSubmit={isEdit ? handleUpdatePage : handleCreatePage}
      enableReinitialize
    >
      {({ values, setFieldValue, errors, touched }) => (
        <Form className="flex flex-col gap-5">
          <FormikPreviewSync setPreviewData={setPreviewData} />

          <AppInput
            name="page_name"
            label={tPageTitle('label')}
            placeholder={tPageTitle('placeholder')}
            requiredAsterisk
          />

          <AppInput
            name="slug"
            label={tSlug('label')}
            placeholder={tSlug('placeholder')}
            requiredAsterisk
          />

          {/* Content */}
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">
                {tContent('label')} <span className="text-help-red">*</span>
              </label>
            </div>

            <RichTextEditor
              value={values.content}
              onChange={(val) => setFieldValue('content', val)}
            />

            {errors.content && touched.content && (
              <p className="text-help-red text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {isEdit && (
            <EditableDocumentField
              name="banner_image"
              label={tBanner('label')}
              existingImageUrl={initialValues?.banner_image as string | null}
            />
          )}

          {!isEdit && (
            <AppFileInput
              disabled={isPending || isUpdatePagePending}
              requiredAsterisk
              name="banner_image"
              label={tBanner('label')}
              previewHeight={120}
            />
          )}

          <div className="flex items-center justify-between border rounded-xl p-4">
            <div>
              <p className="font-medium">{tPublish('title')}</p>
              <p className="text-sm text-muted-foreground">
                {tPublish('subtitle')}
              </p>
            </div>

            <Switch
              disabled={isPending || isUpdatePagePending}
              name="is_published"
              checked={values.is_published}
              onCheckedChange={(val) => setFieldValue('is_published', val)}
            />
          </div>

          <AppButton
            type="submit"
            isLoading={isPending || isUpdatePagePending}
            disabled={isPending || isUpdatePagePending}
          >
            {isEdit ? tButtons('update') : tButtons('save')}
          </AppButton>
        </Form>
      )}
    </Formik>
  );
}
