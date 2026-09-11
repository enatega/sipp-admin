'use client';

import { Form, Formik } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { addonFormValidationSchema } from '@/schemas/vendor/deliveries/product-management/addons.schema';
import { AddonFormValues } from '@/types';
import type { VendorAddon } from '@/types/api/vendor/deliveries/addons.api';
import { Label } from '@/components/ui/label';
import { SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { useCurrency } from '@/hooks/use-currency';
import OptionAsyncMultiSelect from './OptionAsyncMultiSelect';

const parseBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false;
  }
  return fallback;
};

interface AddAddonFormProps {
  onClose: () => void;
  onSubmit?: (values: AddonFormValues) => Promise<void> | void;
  editData?: VendorAddon | null;
}

export function AddAddonForm({
  onClose,
  onSubmit,
  editData,
}: AddAddonFormProps) {
  const t = useTranslations('storeAddons');
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const isEditMode = Boolean(editData);

  const initialValues: AddonFormValues = {
    name: editData?.name || '',
    description: editData?.description || '',
    requiredCheck: parseBoolean(editData?.requiredCheck, true),
    selectionType: editData?.selectionType || '',
    optionIds: editData?.options?.map((option) => option.id) || [],
    price: editData?.price?.toString() || '',
    minSelect: editData?.minSelect?.toString() || '1',
    maxSelect: editData?.maxSelect?.toString() || '1',
    status: parseBoolean(editData?.status, true),
    dependsOnVariationId: editData?.dependsOnVariationId || '',
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

            <AppInputField
              name="price"
              type="number"
              label={`${t('form.priceLabel')} (${resolvedCurrencySymbol})`}
              placeholder={t('form.pricePlaceholder')}
              prefix={
                <span className="font-semibold text-primary">
                  {resolvedCurrencySymbol}
                </span>
              }
              requiredAsterisk
            />

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label className="text-[15px] font-medium">
                  {t('form.statusLabel')}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="addon-status"
                    checked={values.status ?? true}
                    onCheckedChange={(checked) =>
                      setFieldValue('status', checked)
                    }
                  />
                  <Label
                    htmlFor="addon-status"
                    className="font-normal cursor-pointer"
                  >
                    {values.status
                      ? t('form.activeLabel')
                      : t('form.inactiveLabel')}
                  </Label>
                </div>
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
              storeId={routeVendorId}
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
