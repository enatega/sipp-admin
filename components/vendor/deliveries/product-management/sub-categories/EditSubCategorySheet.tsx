'use client';

import { updateSubCategorySchema } from '@/schemas/store/deliveries/product-management/sub-category.schema';
import { ApiErrorResponse, SubCategory, SubCategoryFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateSubCategory } from '@/hooks/api/vendor/deliveries/product-management/sub-categories';
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
import VendorCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorCategoryAsyncSelect';

interface EditSubCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  subCategory: SubCategory;
}

const initialValuesFromSubCategory = (
  subCategory: SubCategory,
): SubCategoryFormData => ({
  name: subCategory.categoryName,
  categoryId: subCategory.parentId || '',
  image: subCategory.imageURL || undefined,
});

export default function EditSubCategorySheet({
  isOpen,
  onClose,
  subCategory,
}: EditSubCategorySheetProps) {
  const t = useTranslations('subCategories');
  const { vendorId } = useParams() as { vendorId?: string };
  const { mutateAsync: updateSubCategory, isPending: isUpdating } =
    useUpdateSubCategory();

  const handleSubmit = async (values: SubCategoryFormData) => {
    try {
      await updateSubCategory({
        id: subCategory.id,
        name: values.name,
        categoryId: values.categoryId,
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
          initialValues={initialValuesFromSubCategory(subCategory)}
          validationSchema={updateSubCategorySchema(t)}
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

                <VendorCategoryAsyncSelect
                  name="categoryId"
                  vendorId={vendorId}
                  initialSelectedCategory={
                    subCategory.parent
                      ? {
                          id: subCategory.parent.id,
                          name: subCategory.parent.categoryName,
                        }
                      : null
                  }
                  label={t('form.categoryLabel')}
                  placeholder={t('form.categoryPlaceholder')}
                  requiredAsterisk
                />

                {subCategory.imageURL && !dirty ? (
                  <div className="space-y-2">
                    <label className="text-[15px] font-medium">
                      {t('form.imageLabel')}
                      <span className="text-destructive ml-1">*</span>
                    </label>
                    <div className="relative w-full max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={subCategory.imageURL}
                        alt={subCategory.categoryName}
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
                    requiredAsterisk
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

