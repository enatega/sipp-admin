import { bannerSchema } from '@/schemas/enatega-deliveries/banners/banner-schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { EnategaDeliveriesBanner } from '@/types/api/super-admin/enatega-deliveries/banners.api';
import { handleApiError } from '@/lib/toast-error';
import {
  usePatchBanner,
  usePostBanner,
} from '@/hooks/api/super-admin/enatega-deliveries/banners';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { InitialValues } from './AddBannerSheet';
import { BannerRelationAsyncSelect } from './BannerRelationAsyncSelect';

export function BannerForm({
  onOpenChange,
  initialValues,
  type,
  bannerId,
  bannerData,
}: {
  onOpenChange: (open: boolean) => void;
  initialValues: InitialValues;
  type: 'add' | 'edit';
  bannerId?: string;
  bannerData?: EnategaDeliveriesBanner | null;
}) {
  const t = useTranslations('enategaDeliveriesPages.banners.form');
  const tMessages = useTranslations('enategaDeliveriesPages.banners.messages');
  const createBanner = usePostBanner();
  const updateBanner = usePatchBanner();

  const actionOptions = [
    { key: t('actionTypes.none'), value: 'none' },
    { key: t('actionTypes.store'), value: 'store' },
    { key: t('actionTypes.product'), value: 'product' },
    { key: t('actionTypes.shopType'), value: 'shop_type' },
  ];

  const pending = createBanner.isPending || updateBanner.isPending;

  const handleSubmit = async (values: InitialValues) => {
    try {
      if (type === 'add') {
        await createBanner.mutateAsync({
          title: values.title,
          description: values.description,
          action_type: values.action_type,
          related_store: values.related_store || null,
          related_product: values.related_product || null,
          related_shop_type: values.related_shop_type || null,
          image: values.image instanceof File ? values.image : null,
          video: values.video instanceof File ? values.video : null,
        });
      } else {
        if (!bannerId) {
          throw new Error('Banner id is required for updates');
        }

        await updateBanner.mutateAsync({
          id: bannerId,
          title: values.title,
          description: values.description,
          action_type: values.action_type,
          related_store: values.related_store || null,
          related_product: values.related_product || null,
          related_shop_type: values.related_shop_type || null,
          image: values.image instanceof File ? values.image : undefined,
          video: values.video instanceof File ? values.video : undefined,
        });
      }

      toast.success(
        type === 'add' ? tMessages('addSuccess') : tMessages('updateSuccess'),
      );
      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={bannerSchema(type === 'add')}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, resetForm, setFieldValue, values }) => (
        <Form className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              <AppInputField
                name="title"
                label={t('bannerTitle')}
                type="text"
                placeholder={t('bannerTitlePlaceholder')}
                requiredAsterisk
              />
              <AppTextarea
                name="description"
                label={t('description')}
                placeholder={t('descriptionPlaceholder')}
                requiredAsterisk
                className="min-h-[110px] rounded-[12px]"
              />

              <AppSelect
                name="action_type"
                label={t('actionType')}
                placeholder={t('actionTypePlaceholder')}
                options={actionOptions}
                requiredAsterisk
                onValueChange={(value) => {
                  const selected = value as InitialValues['action_type'];
                  setFieldValue('action_type', selected);
                  if (selected !== 'store') {
                    setFieldValue('related_store', '');
                  }
                  if (selected !== 'product') {
                    setFieldValue('related_product', '');
                  }
                  if (selected !== 'shop_type') {
                    setFieldValue('related_shop_type', '');
                  }
                }}
              />

              {values.action_type === 'store' && (
                <BannerRelationAsyncSelect
                  name="related_store"
                  relationType="store"
                  label={t('relatedStore')}
                  placeholder={t('relatedStorePlaceholder')}
                  requiredAsterisk
                  initialSelectedOption={
                    bannerData?.store
                      ? {
                          id: bannerData.store.id,
                          name:
                            bannerData.store.name ||
                            bannerData.store.address ||
                            bannerData.store.id,
                        }
                      : undefined
                  }
                />
              )}

              {values.action_type === 'product' && (
                <BannerRelationAsyncSelect
                  name="related_product"
                  relationType="product"
                  label={t('relatedProduct')}
                  placeholder={t('relatedProductPlaceholder')}
                  requiredAsterisk
                  initialSelectedOption={
                    bannerData?.product
                      ? {
                          id: bannerData.product.id,
                          name:
                            bannerData.product.name || bannerData.product.id,
                        }
                      : undefined
                  }
                />
              )}

              {values.action_type === 'shop_type' && (
                <BannerRelationAsyncSelect
                  name="related_shop_type"
                  relationType="shop_type"
                  label={t('relatedShopType')}
                  placeholder={t('relatedShopTypePlaceholder')}
                  requiredAsterisk
                  initialSelectedOption={
                    bannerData?.shopType
                      ? {
                          id: bannerData.shopType.id,
                          name:
                            bannerData.shopType.name || bannerData.shopType.id,
                        }
                      : undefined
                  }
                />
              )}
              <p className="font-medium mb-1">Banner</p>
              <p className="text-sm text-muted-foreground">{t('mediaHint')}</p>

              {/* Show Image input only when video is not selected */}
              {!values.video && (
                <AppFileInput
                  name="image"
                  label="Image"
                  requiredAsterisk={type === 'add' && !values.video}
                  onFileSelected={(file) => {
                    if (file) {
                      setFieldValue('image', file);
                      setFieldValue('video', null);
                    }
                  }}
                />
              )}

              {/* Show Video input only when image is not selected */}
              {!values.image && (
                <AppFileInput
                  name="video"
                  label="Video"
                  requiredAsterisk={type === 'add' && !values.image}
                  acceptTypes={[
                    'video/mp4',
                    'video/webm',
                    'video/ogg',
                    'video/quicktime',
                  ]}
                  onFileSelected={(file) => {
                    if (file) {
                      setFieldValue('video', file);
                      setFieldValue('image', null);
                    }
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-5 justify-end p-4 border-t bg-background">
            <AppButton
              variant="mute"
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting || pending}
            >
              {t('cancel')}
            </AppButton>
            <AppButton
              type="submit"
              disabled={isSubmitting || pending}
              isLoading={isSubmitting || pending}
            >
              {type === 'add' ? t('addSubmit') : t('editSubmit')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
