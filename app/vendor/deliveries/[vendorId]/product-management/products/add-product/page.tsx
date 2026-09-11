'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { ProductFormProvider } from '@/contexts/vendor/deliveries/product-management/product-form-context';
import ProductForm from '@/components/vendor/deliveries/product-management/products/add-product/ProductForm';
import ProductFormStepper from '@/components/vendor/deliveries/product-management/products/add-product/ProductFormStepper';

const AddProduct = () => {
  const t = useTranslations('products');

  return (
    <ProductFormProvider totalSteps={2}>
      <div>
        <Heading title={t('form.createTitle')} showBackBtn={true} />
        <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
          <ProductFormStepper />
          <ProductForm />
        </div>
      </div>
    </ProductFormProvider>
  );
};

export default AddProduct;

