'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getStorePath } from '@/lib/store';
import { Heading } from '@/components/shared/Heading';
import { ProductFormProvider } from '@/contexts/store/deliveries/product-management/product-form-context';
import ProductForm from '@/components/store/deliveries/product-management/products/add-product/ProductForm';
import ProductFormStepper from '@/components/store/deliveries/product-management/products/add-product/ProductFormStepper';
import {
  ProductTypeChooserDialog,
  isProductFormType,
} from '@/components/store/deliveries/product-management/products/add-product/ProductTypeChooserDialog';
import { SingleProductForm } from '@/components/store/deliveries/product-management/products/add-product/SingleProductForm';

const AddProduct = () => {
  const t = useTranslations('products');
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const typeParam = useSearchParams().get('type');
  const type = isProductFormType(typeParam) ? typeParam : null;
  const productsPath = getStorePath(storeId, '/product-management/products');

  return (
    <div>
      <Heading title={t('form.createTitle')} showBackBtn={true} />

      {type === 'single' ? (
        <div className="mt-6">
          <SingleProductForm />
        </div>
      ) : type === 'multiple' ? (
        <ProductFormProvider totalSteps={2}>
          <div className="w-full min-h-[80vh] flex flex-col lg:flex-row mt-6 gap-10 bg-light rounded-lg p-6 border">
            <ProductFormStepper />
            <ProductForm />
          </div>
        </ProductFormProvider>
      ) : (
        // No valid type in the URL: ask instead of guessing.
        // Closing the chooser returns to the product list.
        <ProductTypeChooserDialog
          open
          onClose={() => router.push(productsPath)}
          onSelect={(selectedType) =>
            router.replace(`${productsPath}/add-product?type=${selectedType}`)
          }
        />
      )}
    </div>
  );
};

export default AddProduct;
