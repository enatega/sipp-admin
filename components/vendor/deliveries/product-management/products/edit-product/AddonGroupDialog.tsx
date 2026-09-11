'use client';

import { useEffect, useState } from 'react';
import { addonGroupValidationSchema } from '@/schemas/store/deliveries/product-management/product-customization.schema';
import type {
  EditProductAddonGroupFormValues,
  ProductCustomizationGroup,
} from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import OptionAsyncMultiSelect from '@/components/vendor/deliveries/product-management/addons/add-addon/OptionAsyncMultiSelect';

interface AddonGroupDialogProps {
  open: boolean;
  onClose: () => void;
  storeId?: string;
  isSubmitting: boolean;
  initialGroup?: ProductCustomizationGroup | null;
  onSubmit: (values: EditProductAddonGroupFormValues) => Promise<void>;
}

export function AddonGroupDialog({
  open,
  onClose,
  storeId,
  isSubmitting,
  initialGroup,
  onSubmit,
}: AddonGroupDialogProps) {
  const tProducts = useTranslations('products');
  const tAddons = useTranslations('storeAddons');
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditMode = Boolean(initialGroup);

  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open, initialGroup?.id]);

  const initialValues: EditProductAddonGroupFormValues = {
    name: initialGroup?.name || '',
    description: initialGroup?.description || '',
    requiredCheck: initialGroup?.requiredCheck ?? true,
    selectionType: initialGroup?.selectionType || '',
    optionIds: initialGroup?.options?.map((option) => option.id) || [],
  };

  const selectionOptions = [
    { key: tAddons('form.selectionSingle'), value: 'single' },
    { key: tAddons('form.selectionMulti'), value: 'multi' },
  ];

  const handleClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      showDefaultFooter={false}
      size="2xl"
      title={
        isEditMode
          ? tAddons('form.productEditEditTitle')
          : tAddons('form.productEditAddTitle')
      }
    >
      <Formik
        key={`${initialGroup?.id ?? 'create'}-${open ? 'open' : 'closed'}`}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={addonGroupValidationSchema(tAddons)}
        onSubmit={async (values, { setSubmitting }) => {
          setApiError(null);
          try {
            await onSubmit(values);
            handleClose();
          } catch (error) {
            if (error instanceof Error && error.message) {
              setApiError(error.message);
            } else {
              setApiError(tProducts('errors.fetchFailed'));
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting: isFormSubmitting, errors, touched, values, setFieldValue }) => (
          <Form className="space-y-5">
            <AppInputField
              name="name"
              label={tAddons('form.nameLabel')}
              placeholder={tAddons('form.namePlaceholder')}
              requiredAsterisk
            />

            <AppTextarea
              name="description"
              label={tAddons('form.descriptionLabel')}
              placeholder={tAddons('form.descriptionPlaceholder')}
              rows={3}
            />

            <AppSelect
              name="selectionType"
              label={tAddons('form.selectionTypeLabel')}
              placeholder={tAddons('form.selectionTypePlaceholder')}
              options={selectionOptions}
              requiredAsterisk
            />

            <div className="space-y-2">
              <Label className="text-[15px] font-medium">
                {tAddons('form.requiredLabel')}
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
                    ? tAddons('form.requiredYes')
                    : tAddons('form.requiredNo')}
                </Label>
              </div>
            </div>

            <OptionAsyncMultiSelect
              name="optionIds"
              storeId={storeId}
              label={tAddons('form.optionsLabel')}
              placeholder={tAddons('form.optionsPlaceholder')}
              requiredAsterisk
              initialSelectedOptions={
                initialGroup?.options?.map((option) => ({
                  ...option,
                  description: option.description ?? '',
                })) ?? []
              }
            />

            <FormErrorDisplay
              apiError={apiError}
              formikErrors={errors}
              touched={touched}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting || isFormSubmitting}
              >
                {tProducts('form.cancelButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting || isFormSubmitting}
                disabled={isSubmitting || isFormSubmitting}
              >
                {isEditMode
                  ? tAddons('form.productEditUpdateButton')
                  : tAddons('form.productEditCreateButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}

