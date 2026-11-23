'use client';

import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePostShopType } from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import { handleApiError } from '@/lib/toast-error';
import { addShopTypeSchema } from '@/schemas/enatega-deliveries/add-shop-type/add-shop-type-schema';
import { ApiErrorResponse, PostShopTypePayload } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { ShopTypeFormValues } from '../common/type';

export function AddShopTypeForm() {
  const t = useTranslations('lumiFood.shopTypes.addForm');
  const tFields = useTranslations('lumiFood.shopTypes.addForm.fields');
  const tButtons = useTranslations('lumiFood.shopTypes.addForm.buttons');
  const tToasts = useTranslations('lumiFood.shopTypes.addForm.toasts');
  const tSchema = useTranslations('Schemas.shopType');
  const { mutateAsync: createShopType, isPending } = usePostShopType();
  const router = useRouter();
  const pathname = usePathname();

  const EMPTY_SHOP_TYPE: ShopTypeFormValues = {
    name: '',
    image: null,
    description: '',
    is_active: false,
  };

  const handleSubmit = async (
    values: ShopTypeFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: PostShopTypePayload = {
        name: values?.name,
        image: values?.image instanceof File ? values?.image : undefined,
        description: values?.description || undefined,
        is_active: values?.is_active,
      };

      await createShopType(payload);
      toast.success(tToasts('createSuccess'));
      resetForm();
      router.push(
        buildScopedDeliveriesAdminPathFromCurrent(
          pathname,
          '/enatega-deliveries/shop-types',
        ),
      );
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div
      className="p-6 rounded-md shadow-md bg-white mx-auto w-full"
      style={{
        maxWidth: '758px',
      }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
      </div>
      <Formik
        initialValues={EMPTY_SHOP_TYPE}
        enableReinitialize
        validationSchema={addShopTypeSchema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, resetForm }) => (
          <Form className="flex flex-col gap-4 w-full">
            <AppInputField
              label={tFields('nameLabel')}
              name="name"
              type="text"
              placeholder={tFields('namePlaceholder')}
              requiredAsterisk
            />

            <AppFileInput
              name="image"
              label={tFields('iconLabel')}
              helperText={tFields('iconHelperText')}
              disabled={false}
              requiredAsterisk
            />
            <AppInputField
              label={tFields('descriptionLabel')}
              name="description"
              type="text"
              placeholder={tFields('descriptionPlaceholder')}
              requiredAsterisk
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="is_active" className="text-base font-medium">
                {tFields('statusLabel')}
              </Label>
              <div className="flex items-center gap-2 mt-3">
                <Switch
                  checked={values.is_active}
                  onCheckedChange={(checked: boolean) =>
                    setFieldValue('is_active', checked)
                  }
                  disabled={isPending}
                />
                <p className="text-mute text-sm ">
                  {values.is_active
                    ? tFields('statusEnabled')
                    : tFields('statusDisabled')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <AppButton
                type="button"
                className="w-full max-w-[100px]"
                variant="secondary"
                onClick={() => resetForm()}
                disabled={isPending}
              >
                {tButtons('reset')}
              </AppButton>
              <AppButton
                type="submit"
                className="w-full max-w-[100px]"
                isLoading={isPending}
              >
                {tButtons('publish')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
