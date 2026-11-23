'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { addOptionValidationSchema } from '@/schemas/store/deliveries/product-management/options/add-option.schema';
import { ApiErrorResponse, CreateOptionResponse, OptionFormData } from '@/types';
import { Form, Formik, type FormikHelpers } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCreateOption } from '@/hooks/api/store/deliveries/product-management/options';
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
import { CatalogTextTranslationsFields } from '@/components/store/deliveries/product-management/common/CatalogTextTranslationsFields';

interface AddOptionSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (createdOption: CreateOptionResponse) => void;
}

export default function AddOptionSidebar({
  open,
  onOpenChange,
  onCreated,
}: AddOptionSidebarProps) {
  const tForm = useTranslations('storeOptions.form');
  const tRoot = useTranslations('storeOptions');
  const tValidation = useTranslations('storeOptions.validation');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const { storeId } = useParams() as { storeId?: string };
  const cancelLabel = tForm.has('cancelButton') ? tForm('cancelButton') : 'Cancel';
  const { mutateAsync: createOption, isPending: isCreating } = useCreateOption();

  const initialValues: OptionFormData = {
    title: '',
    titleTranslations: {},
    description: '',
    descriptionTranslations: {},
    stockQuantity: '',
    price: '',
  };

  const handleSubmit = async (
    values: OptionFormData,
    { resetForm }: FormikHelpers<OptionFormData>,
  ) => {
    if (!storeId) {
      return;
    }

    try {
      const createdOption = await createOption({
        store_id: storeId,
        title: values.title.trim(),
        titleTranslations: values.titleTranslations,
        description: values.description.trim(),
        descriptionTranslations: values.descriptionTranslations,
        unitOfMeasure: '',
        stockQuantity: Number(values.stockQuantity),
        price: Number(values.price),
      });
      toast.success(tRoot('success.create'));
      onCreated?.(createdOption);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle className="text-lg font-semibold">
            {tForm('addTitle')}
          </SheetTitle>
        </SheetHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={addOptionValidationSchema(tValidation)}
          onSubmit={handleSubmit}
        >
          {({ dirty, handleSubmit: formikHandleSubmit, isSubmitting }) => (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
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

                <CatalogTextTranslationsFields
                  kind="optionTitle"
                  sourceName="title"
                  translationsName="titleTranslations"
                />

                <AppTextarea
                  label={tForm('descriptionLabel')}
                  placeholder={tForm('descriptionPlaceholder')}
                  name="description"
                  rows={4}
                />

                <CatalogTextTranslationsFields
                  kind="optionDescription"
                  sourceName="description"
                  translationsName="descriptionTranslations"
                  multiline
                  maxLength={2000}
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
                    disabled={isSubmitting || isCreating}
                  >
                    {cancelLabel}
                  </AppButton>
                  <AppButton
                    type="submit"
                    isLoading={isSubmitting || isCreating}
                    disabled={!dirty}
                    className="px-14"
                  >
                    {tForm('createButton')}
                  </AppButton>
                </div>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
