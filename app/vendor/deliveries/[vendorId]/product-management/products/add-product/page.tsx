'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getVendorPath } from '@/lib/vendor';
import { Heading } from '@/components/shared/Heading';
import { ProductFormProvider } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import {
  ProductTypeChooserDialog,
  isProductFormType,
} from '@/components/store/deliveries/product-management/products/add-product/ProductTypeChooserDialog';
import ProductForm from '@/components/vendor/deliveries/product-management/products/add-product/ProductForm';
import ProductFormStepper from '@/components/vendor/deliveries/product-management/products/add-product/ProductFormStepper';
import { SingleProductForm } from '@/components/vendor/deliveries/product-management/products/add-product/SingleProductForm';

const AddProduct = () => {
  const t = useTranslations('products');
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId?: string };
  const typeParam = useSearchParams().get('type');
  const type = isProductFormType(typeParam) ? typeParam : null;
  const productsPath = getVendorPath(vendorId, '/product-management/products');

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
