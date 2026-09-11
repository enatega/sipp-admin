'use client';

import { editOptionValidationSchema } from '@/schemas/store/deliveries/product-management/options/edit-option.schema';
import { ApiErrorResponse, OptionFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetOption,
  useUpdateOption,
} from '@/hooks/api/store/deliveries/product-management/options';
import { useCurrency } from '@/hooks/use-currency';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface EditOptionSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionId?: string | null;
}

export default function EditOptionSidebar({
  open,
  onOpenChange,
  optionId,
}: EditOptionSidebarProps) {
  const tForm = useTranslations('storeOptions.form');
  const tErrors = useTranslations('storeOptions.errors');
  const tSuccess = useTranslations('storeOptions.success');
  const tValidation = useTranslations('storeOptions.validation');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const cancelLabel = tForm.has('cancelButton') ? tForm('cancelButton') : 'Cancel';
  const {
    data: option,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOption(optionId || '', {
    enabled: open && !!optionId,
  });
  const { mutateAsync: updateOption, isPending: isUpdating } =
    useUpdateOption();

  const initialValues: OptionFormData = {
    title: option?.title ?? '',
    description: option?.description ?? '',
    stockQuantity: option?.stockQuantity?.toString() ?? '',
    price: option?.price?.toString() ?? '',
  };

  const handleSubmit = async (values: OptionFormData) => {
    if (!optionId) return;

    try {
      await updateOption({
        id: optionId,
        title: values.title.trim(),
        description: values.description.trim(),
        unitOfMeasure: '',
        stockQuantity: Number(values.stockQuantity),
        price: Number(values.price),
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
        {!optionId ? null : isLoading ? (
          <div className="py-10 text-center text-sm text-mute">
            {tForm('loading')}
          </div>
        ) : isError ? (
          <div className="py-6">
            <DisplayError
              title={tErrors('fetchSingleFailedTitle')}
              message={
                returnErrorMessage(error as ApiErrorResponse) ||
                tErrors('fetchSingleFailed')
              }
              onRetry={refetch}
            />
          </div>
        ) : option ? (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={editOptionValidationSchema(tValidation)}
            onSubmit={handleSubmit}
          >
            {({ dirty, handleSubmit: formikHandleSubmit, isSubmitting }) => (
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
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
