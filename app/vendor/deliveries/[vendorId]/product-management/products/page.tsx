'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getVendorPath } from '@/lib/vendor';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import ProductsTabs from '@/components/vendor/deliveries/product-management/products/tabs';

const Products = () => {
  const t = useTranslations('products');
  const { vendorId: storeId } = useParams() as { vendorId?: string };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Heading title={t('title')} />
        <Link
          href={getVendorPath(
            storeId,
            '/product-management/products/add-product',
          )}
        >
          <AppButton leftIcon={<CirclePlus size={16} />}>
            {t('addProductButton')}
          </AppButton>
        </Link>
      </div>
      <div>
        <ProductsTabs />
      </div>
    </div>
  );
};

export default Products;


