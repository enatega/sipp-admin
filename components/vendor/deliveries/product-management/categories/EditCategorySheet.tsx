'use client';

import { updateCategorySchema } from '@/schemas/store/deliveries/product-management/category.schema';
import { ApiErrorResponse, Category, CategoryFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateCategory } from '@/hooks/api/vendor/deliveries/product-management/categories';
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

interface EditCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

const initialValuesFromCategory = (category: Category): CategoryFormData => ({
  name: category.categoryName,
  image: category.imageURL || undefined,
});

export default function EditCategorySheet({
  isOpen,
  onClose,
  category,
}: EditCategorySheetProps) {
  const t = useTranslations('categories');
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateCategory();

  const handleSubmit = async (values: CategoryFormData) => {
    try {
      await updateCategory({
        id: category.id,
        name: values.name,
        image: values.image,
      });
      toast.success(t('success.update'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <Formik
          initialValues={initialValuesFromCategory(category)}
          validationSchema={updateCategorySchema(t)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, dirty, setFieldValue }) => (
            <Form className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{t('form.editTitle')}</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
                <AppInputField
                  name="name"
                  label={t('form.nameLabel')}
                  placeholder={t('form.namePlaceholder')}
                  requiredAsterisk
                />

                {category.imageURL && !dirty ? (
                  <div className="space-y-2">
                    <label className="text-[15px] font-medium">
                      {t('form.imageLabel')}
                    </label>
                    <div className="relative w-full max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={category.imageURL}
                        alt={category.categoryName}
                        className="h-[120px] w-full rounded-lg border object-cover"
                      />
                    </div>
                    <AppFileInput
                      name="image"
                      label=""
                      acceptTypes={[
                        'image/png',
                        'image/jpeg',
                        'image/jpg',
                        'image/webp',
                      ]}
                      maxSizeMB={5}
                      previewHeight={120}
                      onFileSelected={(file) => {
                        setFieldValue('image', file);
                      }}
                    />
                  </div>
                ) : (
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
                )}
              </div>

              <SheetFooter className="mt-auto pt-5">
                <div className="flex w-full justify-end gap-4">
                  <AppButton
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="px-12"
                    disabled={isSubmitting || isUpdating}
                  >
                    {t('form.cancelButton')}
                  </AppButton>
                  <AppButton
                    type="submit"
                    isLoading={isSubmitting || isUpdating}
                    disabled={!dirty}
                    className="px-14"
                  >
                    {t('form.updateButton')}
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

