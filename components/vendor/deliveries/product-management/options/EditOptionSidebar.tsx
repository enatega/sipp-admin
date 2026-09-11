'use client';

import { editOptionValidationSchema } from '@/schemas/store/deliveries/product-management/options/edit-option.schema';
import { ApiErrorResponse, Option as StoreOption, OptionFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateOption } from '@/hooks/api/vendor/deliveries/product-management/options';
import { useCurrency } from '@/hooks/use-currency';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface EditOptionSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option?: StoreOption | null;
}

export default function EditOptionSidebar({
  open,
  onOpenChange,
  option,
}: EditOptionSidebarProps) {
  const tForm = useTranslations('storeOptions.form');
  const tSuccess = useTranslations('storeOptions.success');
  const tValidation = useTranslations('storeOptions.validation');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const cancelLabel = tForm.has('cancelButton') ? tForm('cancelButton') : 'Cancel';
  const { mutateAsync: updateOption, isPending: isUpdating } =
    useUpdateOption();

  const initialValues: OptionFormData = {
    title: option?.title ?? '',
    description: option?.description ?? '',
    stockQuantity: option?.stockQuantity?.toString() ?? '',
    price: option?.price?.toString() ?? '',
    isActive: option?.isActive ?? true,
  };

  const handleSubmit = async (values: OptionFormData) => {
    if (!option) return;

    try {
      await updateOption({
        id: option.id,
        title: values.title.trim(),
        description: values.description.trim(),
        unitOfMeasure: option.unitOfMeasure ?? '',
        stockQuantity: Number(values.stockQuantity),
        price: Number(values.price),
        isActive: values.isActive ?? true,
      });
      toast.success(tSuccess('update'));
      onOpenChange(false);
    } catch (submitError) {
      handleApiError(submitError as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle className="text-lg font-semibold">
            {tForm('editTitle')}
          </SheetTitle>
        </SheetHeader>
        {!option ? null : (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={editOptionValidationSchema(tValidation)}
            onSubmit={handleSubmit}
          >
            {({
              dirty,
              handleSubmit: formikHandleSubmit,
              isSubmitting,
              values,
              setFieldValue,
            }) => (
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  formikHandleSubmit();
                }}
                className="flex h-full flex-col"
              >
                <div className="space-y-4">
                  <AppInputField
                    label={tForm('titleLabel')}
                    placeholder={tForm('titlePlaceholder')}
                    name="title"
                    requiredAsterisk
                  />

                  <AppTextarea
                    label={tForm('descriptionLabel')}
                    placeholder={tForm('descriptionPlaceholder')}
                    name="description"
                    rows={4}
                    requiredAsterisk
                  />

                  <AppInputField
                    label={tForm('stockQuantityLabel')}
                    placeholder={tForm('stockQuantityPlaceholder')}
                    name="stockQuantity"
                    type="number"
                    requiredAsterisk
                  />

                  <AppInputField
                    label={`${tForm('priceLabel')} (${resolvedCurrencySymbol})`}
                    placeholder={tForm('pricePlaceholder')}
                    name="price"
                    type="number"
                    prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
                    requiredAsterisk
                  />

                  <div className="space-y-2">
                    <Label className="text-[15px] font-medium">
                      {tForm('statusLabel')}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={Boolean(values.isActive)}
                        onCheckedChange={(checked) => {
                          void setFieldValue('isActive', checked);
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {values.isActive
                          ? tForm('activeLabel')
                          : tForm('inactiveLabel')}
                      </span>
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-auto pt-5">
                  <div className="flex w-full justify-end gap-4">
                    <AppButton
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenChange(false)}
                      className="px-12"
                      disabled={isSubmitting || isUpdating}
                    >
                      {cancelLabel}
                    </AppButton>
                    <AppButton
                      type="submit"
                      isLoading={isSubmitting || isUpdating}
                      disabled={!dirty}
                      className="px-14"
                    >
                      {tForm('updateButton')}
                    </AppButton>
                  </div>
                </SheetFooter>
              </Form>
            )}
          </Formik>
        )}
      </SheetContent>
    </Sheet>
  );
}
