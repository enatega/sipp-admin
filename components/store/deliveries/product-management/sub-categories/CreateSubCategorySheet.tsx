'use client';

import * as React from 'react';
import { createSubCategorySchema } from '@/schemas/store/deliveries/product-management/sub-category.schema';
import { ApiErrorResponse, SubCategory, SubCategoryFormData } from '@/types';
import { Form, Formik } from 'formik';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCreateSubCategory } from '@/hooks/api/store/deliveries/product-management/sub-categories';
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
import CategoryAsyncSelect from './CategoryAsyncSelect';

interface CreateSubCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
  onCreated?: (subCategory: SubCategory) => void;
}

export default function CreateSubCategorySheet({
  isOpen,
  onClose,
  defaultCategoryId,
  onCreated,
}: CreateSubCategorySheetProps) {
  const t = useTranslations('subCategories');
  const { storeId } = useParams() as { storeId?: string };
  const { mutateAsync: createSubCategory, isPending: isCreating } =
    useCreateSubCategory();
  const initialValues = React.useMemo<SubCategoryFormData>(
    () => ({
      name: '',
      categoryId: defaultCategoryId ?? '',
      image: undefined,
    }),
    [defaultCategoryId],
  );

  const handleSubmit = async (values: SubCategoryFormData) => {
    if (!storeId) {
      return;
    }

    try {
      const createdSubCategory = await createSubCategory({
        name: values.name,
        categoryId: values.categoryId,
        storeId,
        image: values.image instanceof File ? values.image : undefined,
      });
      onCreated?.(createdSubCategory);
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
          validationSchema={createSubCategorySchema(t)}
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

                <CategoryAsyncSelect
                  name="categoryId"
                  storeId={storeId}
                  label={t('form.categoryLabel')}
                  placeholder={t('form.categoryPlaceholder')}
                  requiredAsterisk
                />

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
