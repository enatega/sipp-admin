'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ApiErrorResponse, EditProductFormValues } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { extractDealIdFromProduct } from '@/lib/deal-pricing';
import { getProductCoverImage } from '@/lib/product-images';
import { hasVariationSettings } from '@/lib/product-variation-settings';
import { getStorePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetProduct,
  useUpdateProduct,
} from '@/hooks/api/store/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { Heading } from '@/components/shared/Heading';
import { EditProductForm } from '@/components/store/deliveries/product-management/products/edit-product/EditProductForm';
import EditProductFormShimmer from '@/components/store/deliveries/product-management/products/edit-product/EditProductFormShimmer';

export default function EditProductPage() {
  const t = useTranslations('products');
  const tErrors = useTranslations('products.errors');
  const tForm = useTranslations('products.form');
  const params = useParams() as {
    id?: string;
    storeId?: string;
    slug?: string[];
  };
  const stickyHeaderClass =
    'sticky -top-4 z-20 flex items-center gap-4 rounded-xl border bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80';

  const productId =
    params.id ||
    (Array.isArray(params.slug) ? params.slug[params.slug.length - 1] : '');
  const productsPath = getStorePath(
    params.storeId,
    '/product-management/products',
  );

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProduct(productId);

  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  const handleSubmit = async (values: EditProductFormValues) => {
    if (!productId) return;

    setSubmitError(null);

    try {
      const originalFoodIds = product?.favouriteFoods?.map((food) => food.id) ?? [];
      const selectedFoodIds = values.favouriteFoodIds ?? [];
      const tagsChanged = originalFoodIds.length !== selectedFoodIds.length ||
        originalFoodIds.some((id) => !selectedFoodIds.includes(id));

      await updateProduct({
        id: productId,
        category_id: values.categoryId,
        subcategory_id: values.subcategoryId || '',
        deal_ids: values.dealId ? [values.dealId] : [],
        favouriteFoodIds: tagsChanged ? selectedFoodIds : undefined,
        name: values.name.trim(),
        sku: values.sku?.trim() || undefined,
        nameTranslations: values.nameTranslations,
        price: product?.customizationGroups?.some((group) => group?.type === 'variation')
          ? undefined
          : Number(values.price),
        taxRateId: values.taxRateId || undefined,
        useDefaultTax: !values.taxRateId,
        // Stock lives on each variation once the product has variation settings.
        stock_quantity: hasVariationSettings(product)
          ? undefined
          : Number(values.stockQuantity),
        description: values.description || undefined,
        descriptionTranslations: values.descriptionTranslations,
        unit_of_measure: values.unitOfMeasure || undefined,
        // Products have a single image. Only a newly picked file is sent; the
        // API then replaces the stored image (and any legacy gallery) with it.
        image: values.image instanceof File ? values.image : undefined,
      });

      toast.success(t('success.update'));
    } catch (submitErr) {
      setSubmitError(returnErrorMessage(submitErr as ApiErrorResponse));
    }
  };

  if (isLoading) {
    return <EditProductFormShimmer />;
  }

  if (isError || !product) {
    return (
      <div className="space-y-6">
        <div className={stickyHeaderClass}>
          <Link href={productsPath}>
            <AppButton variant="mute" size="sm" className="h-9 w-9">
              <ArrowLeft size={18} />
            </AppButton>
          </Link>
          <Heading title={tForm('editTitle')} />
        </div>
        <FormErrorDisplay
          apiError={
            returnErrorMessage(error as ApiErrorResponse) ||
            tErrors('fetchFailed')
          }
        />
        <div>
          <AppButton onClick={() => void refetch()}>
            {tErrors('retry')}
          </AppButton>
        </div>
      </div>
    );
  }

  const initialValues: EditProductFormValues = {
    name: product.name || '',
    sku: product.sku || '',
    nameTranslations: product.nameTranslations || {},
    favouriteFoodIds: product.favouriteFoods?.map((food) => food.id) ?? [],
    categoryId: product.category_id || product.category?.id || '',
    subcategoryId: product.subcategory_id || product.subcategory?.id || '',
    dealId: extractDealIdFromProduct(product as Record<string, unknown>),
    price: String(product.price ?? ''),
    taxRateId: product.taxRateId || '',
    stockQuantity: String(product.stockQuantity ?? 0),
    unitOfMeasure: product.unitOfMeasure || '',
    description: product.description || '',
    descriptionTranslations: product.descriptionTranslations || {},
    image: getProductCoverImage(product) || undefined,
  };

  return (
    <div className="space-y-6">
      <div className={stickyHeaderClass}>
        <Link href={productsPath}>
          <AppButton variant="mute" size="sm" className="h-9 w-9">
            <ArrowLeft size={18} />
          </AppButton>
        </Link>
        <Heading title={tForm('editTitle')} />
      </div>

      <FormErrorDisplay apiError={submitError} />

      <EditProductForm
        initialValues={initialValues}
        product={product}
        storeId={params.storeId}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
