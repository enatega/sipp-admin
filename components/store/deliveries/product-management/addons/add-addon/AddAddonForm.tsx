'use client';

import { addonFormValidationSchema } from '@/schemas/store/deliveries/product-management/addons.schema';
import { Addon, AddonFormValues } from '@/types';
import { Form, Formik } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import OptionAsyncMultiSelect from './OptionAsyncMultiSelect';

interface AddAddonFormProps {
  onClose: () => void;
  onSubmit?: (values: AddonFormValues) => Promise<void> | void;
  editData?: Addon | null;
}

export function AddAddonForm({
  onClose,
  onSubmit,
  editData,
}: AddAddonFormProps) {
  const t = useTranslations('storeAddons');
  const { storeId } = useParams() as { storeId?: string };
  const isEditMode = Boolean(editData);

  const initialValues: AddonFormValues = {
    name: editData?.name || '',
    description: editData?.description || '',
    requiredCheck: editData?.requiredCheck ?? true,
    selectionType: editData?.selectionType || '',
    optionIds: editData?.options?.map((option) => option.id) || [],
  };

  const selectionOptions = [
    {
      key: t('form.selectionSingle'),
      value: 'single',
    },
    {
      key: t('form.selectionMulti'),
      value: 'multi',
    },
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addonFormValidationSchema(t)}
      onSubmit={async (values) => {
        await onSubmit?.(values);
      }}
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting, dirty }) => (
        <Form className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <AppInputField
              name="name"
              label={t('form.nameLabel')}
              placeholder={t('form.namePlaceholder')}
              requiredAsterisk
            />

            <AppTextarea
              name="description"
              label={t('form.descriptionLabel')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />

            <div className="space-y-2">
              <Label className="text-[15px] font-medium">
                {t('form.requiredLabel')}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="required-check"
                  checked={values.requiredCheck}
                  onCheckedChange={(checked) =>
                    setFieldValue('requiredCheck', checked)
                  }
                />
                <Label
                  htmlFor="required-check"
                  className="font-normal cursor-pointer"
                >
                  {values.requiredCheck
                    ? t('form.requiredYes')
                    : t('form.requiredNo')}
                </Label>
              </div>
            </div>

            <AppSelect
              name="selectionType"
              label={t('form.selectionTypeLabel')}
              placeholder={t('form.selectionTypePlaceholder')}
              options={selectionOptions}
              requiredAsterisk
            />

            <OptionAsyncMultiSelect
              name="optionIds"
              storeId={storeId}
              label={t('form.optionsLabel')}
              placeholder={t('form.optionsPlaceholder')}
              requiredAsterisk
              initialSelectedOptions={editData?.options ?? []}
            />
          </div>

          <SheetFooter className="mt-auto pt-5">
            <div className="flex w-full justify-end gap-4">
              <AppButton
                type="button"
                variant="secondary"
                onClick={onClose}
                className="px-12"
                disabled={isSubmitting}
              >
                {t('form.cancelButton')}
              </AppButton>
              <AppButton
                type="submit"
                className="px-14"
                isLoading={isSubmitting}
                disabled={isSubmitting || (!dirty && !isEditMode)}
              >
                {isEditMode ? t('form.updateButton') : t('form.createButton')}
              </AppButton>
            </div>
          </SheetFooter>
        </Form>
      )}
    </Formik>
  );
}

export type { AddonFormValues };
