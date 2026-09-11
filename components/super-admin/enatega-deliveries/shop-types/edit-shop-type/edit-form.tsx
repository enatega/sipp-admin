'use client';

import { editShopTypeSchema } from '@/schemas/enatega-deliveries/add-shop-type/edit-shop-type-schema';
import { ApiErrorResponse, PutShopTypePayload } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePutShopType } from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { ShopTypeFormValues } from '@/components/super-admin/enatega-deliveries/shop-types/common/type';
import { EditShopTypeFormProps } from '../common/type';

export function EditShopTypeForm({
  onClose,
  shopTypeData,
}: EditShopTypeFormProps) {
  const tFields = useTranslations('lumiFood.shopTypes.editForm.fields');
  const tButtons = useTranslations('lumiFood.shopTypes.editForm.buttons');
  const tToasts = useTranslations('lumiFood.shopTypes.editForm.toasts');
  const tSchema = useTranslations('Schemas.shopType');
  const { mutateAsync: updateShopType, isPending } = usePutShopType();

  const initialValues: ShopTypeFormValues = {
    name: shopTypeData?.name || '',
    image: shopTypeData?.image || null,
    description: shopTypeData?.description || '',
    is_active: shopTypeData?.is_active || false,
  };

  const handleSubmit = async (values: ShopTypeFormValues) => {
    try {
      const payload: PutShopTypePayload = {
        shopTypeId: shopTypeData?.id,
        name: values?.name,
        image: values?.image instanceof File ? values?.image : undefined,
        description: values?.description || undefined,
        is_active: values?.is_active,
      };

      await updateShopType(payload);
      toast.success(tToasts('updateSuccess'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={editShopTypeSchema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
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
              disabled={isPending}
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
            <div className="flex justify-end mt-10 gap-4">
              <AppButton
                type="button"
                className="w-full max-w-[150px]"
                variant="secondary"
                onClick={onClose}
                disabled={isPending}
              >
                {tButtons('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                className="w-full max-w-[150px]"
                isLoading={isPending}
              >
                {tButtons('update')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
