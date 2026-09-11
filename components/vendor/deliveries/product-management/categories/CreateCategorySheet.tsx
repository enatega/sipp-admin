'use client';

import { createCategorySchema } from '@/schemas/store/deliveries/product-management/category.schema';
import { ApiErrorResponse, Category, CategoryFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCreateCategory } from '@/hooks/api/vendor/deliveries/product-management/categories';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';

interface CreateCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (category: Category) => void;
}

const initialValues: CategoryFormData = {
  name: '',
  image: undefined,
};

export default function CreateCategorySheet({
  isOpen,
  onClose,
  onCreated,
}: CreateCategorySheetProps) {
  const t = useTranslations('categories');
  const { vendorId: storeId } = useParams() as { vendorId?: string };
  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateCategory();

  const handleSubmit = async (values: CategoryFormData) => {
    if (!storeId || !(values.image instanceof File)) {
      return;
    }

    try {
      const createdCategory = await createCategory({
        name: values.name,
        image: values.image,
        storeId,
      });
      onCreated?.(createdCategory);
      toast.success(t('success.create'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <Formik
          initialValues={initialValues}
          validationSchema={createCategorySchema(t)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, dirty }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('form.createTitle')}</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
                <AppInputField
                  name="name"
                  label={t('form.nameLabel')}
                  placeholder={t('form.namePlaceholder')}
                  requiredAsterisk
                />
                <AppFileInput
                  name="image"
                  label={t('form.imageLabel')}
                  helperText={t('form.imageHelper')}
                  acceptTypes={[
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                    'image/webp',
                  ]}
                  maxSizeMB={5}
                  previewHeight={120}
                />
              </div>

              <SheetFooter className="mt-auto pt-5">
                <div className="flex w-full justify-end gap-4">
                  <AppButton
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="px-12"
                    disabled={isSubmitting || isCreating}
                  >
                    {t('form.cancelButton')}
                  </AppButton>
                  <AppButton
                    type="submit"
                    isLoading={isSubmitting || isCreating}
                    disabled={!dirty}
                    className="px-14"
                  >
                    {t('form.createButton')}
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

