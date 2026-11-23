'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getVendorPath } from '@/lib/vendor';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { ProductTypeChooserDialog } from '@/components/store/deliveries/product-management/products/add-product/ProductTypeChooserDialog';
import ProductsTabs from '@/components/vendor/deliveries/product-management/products/tabs';

const Products = () => {
  const t = useTranslations('products');
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId?: string };
  const [isTypeChooserOpen, setIsTypeChooserOpen] = React.useState(false);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Heading title={t('title')} />
        <AppButton
          leftIcon={<CirclePlus size={16} />}
          onClick={() => setIsTypeChooserOpen(true)}
        >
          {t('addProductButton')}
        </AppButton>
      </div>
      <div>
        <ProductsTabs />
      </div>
      <ProductTypeChooserDialog
        open={isTypeChooserOpen}
        onClose={() => setIsTypeChooserOpen(false)}
        onSelect={(type) =>
          router.push(
            `${getVendorPath(
              vendorId,
              '/product-management/products/add-product',
            )}?type=${type}`,
          )
        }
      />
    </div>
  );
};

export default Products;
