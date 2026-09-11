'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CirclePlus, Upload } from 'lucide-react';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import { getStorePath } from '@/lib/store';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { BulkProductUploadDialog } from '@/components/store/deliveries/product-management/products/tabs/BulkProductUploadDialog';
import ProductsTabs from '@/components/store/deliveries/product-management/products/tabs';

const Products = () => {
  const t = useTranslations('products');
  const { storeId } = useParams() as { storeId?: string };
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Heading title={t('title')} />
        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            leftIcon={<Upload size={16} />}
            onClick={() => setIsBulkDialogOpen(true)}
          >
            {t('bulkUpload.button')}
          </AppButton>
          <Link
            href={getStorePath(
              storeId,
              '/product-management/products/add-product',
            )}
          >
            <AppButton leftIcon={<CirclePlus size={16} />}>
              {t('addProductButton')}
            </AppButton>
          </Link>
        </div>
      </div>
      <div>
        <ProductsTabs />
      </div>
      <BulkProductUploadDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        storeId={storeId}
      />
    </div>
  );
};

export default Products;
