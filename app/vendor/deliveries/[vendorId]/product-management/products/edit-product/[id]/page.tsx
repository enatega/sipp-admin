'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ApiErrorResponse, EditProductFormValues } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { getVendorPath } from '@/lib/vendor';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetProduct,
  useUpdateProduct,
} from '@/hooks/api/vendor/deliveries/product-management/products';
import { AppButton } from '@/components/shared/AppButton';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { Heading } from '@/components/shared/Heading';
import { EditProductForm } from '@/components/vendor/deliveries/product-management/products/edit-product/EditProductForm';
import EditProductFormShimmer from '@/components/vendor/deliveries/product-management/products/edit-product/EditProductFormShimmer';

export default function EditProductPage() {
  const t = useTranslations('products');
  const tErrors = useTranslations('products.errors');
  const tForm = useTranslations('products.form');
  const params = useParams() as {
    id?: string;
    vendorId?: string;
    slug?: string[];
  };
  const stickyHeaderClass =
    'sticky -top-4 z-20 flex items-center gap-4 rounded-xl border bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80';

  const productId =
    params.id ||
    (Array.isArray(params.slug) ? params.slug[params.slug.length - 1] : '');
  const productsPath = getVendorPath(
    params.vendorId,
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
      await updateProduct({
        id: productId,
        category_id: values.categoryId,
        subcategory_id: values.subcategoryId || undefined,
        name: values.name.trim(),
        price: Number(values.price),
        taxRateId: values.taxRateId || undefined,
        useDefaultTax: !values.taxRateId,
        stock_quantity: Number(values.stockQuantity),
        description: values.description || undefined,
        unit_of_measure: values.unitOfMeasure || undefined,
        image: values.image,
        menu_ids: values.menuIds,
        deal_ids: values.dealId ? [values.dealId] : [],
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
    menuIds: product.menu_ids || product.menuIds || [],
    categoryId: product.category_id || product.category?.id || '',
    subcategoryId: product.subcategory_id || product.subcategory?.id || '',
    price: String(product.price ?? ''),
    taxRateId: product.taxRateId || '',
    stockQuantity: String(product.stockQuantity ?? 0),
    unitOfMeasure: product.unitOfMeasure || '',
    description: product.description || '',
    image: product.imageUrl || undefined,
    dealId:
      (Array.isArray(product.deal_ids) && product.deal_ids[0]) ||
      (Array.isArray(product.dealIds) && product.dealIds[0]) ||
      '',
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
        storeId={params.vendorId}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
