'use client';

import { useParams, useRouter } from 'next/navigation';
import { CirclePlus, Upload } from 'lucide-react';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import { getStorePath } from '@/lib/store';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { ProductTypeChooserDialog } from '@/components/store/deliveries/product-management/products/add-product/ProductTypeChooserDialog';
import { BulkProductUploadDialog } from '@/components/store/deliveries/product-management/products/tabs/BulkProductUploadDialog';
import {
  BulkProductUploadStatus,
  type BulkUploadTrackingRecord,
} from '@/components/store/deliveries/product-management/products/tabs/BulkProductUploadStatus';
import ProductsTabs from '@/components/store/deliveries/product-management/products/tabs';
import type { BulkUploadProductsResponse } from '@/types';

const trackingStorageKey = (storeId: string) =>
  `sipp:bulk-product-upload:v1:${storeId}`;
const TRACKING_CHANGED_EVENT = 'sipp:bulk-product-upload-changed';

const isTrackingRecord = (value: unknown): value is BulkUploadTrackingRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<BulkUploadTrackingRecord>;
  return typeof record.jobId === 'string' &&
    typeof record.fileName === 'string' &&
    typeof record.totalRows === 'number' &&
    typeof record.estimatedProducts === 'number' &&
    typeof record.queuedAt === 'number';
};

const parseTrackingRecord = (stored: string | null): BulkUploadTrackingRecord | null => {
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    return isTrackingRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const useBulkUploadTracking = (storeId?: string) => {
  const key = storeId ? trackingStorageKey(storeId) : null;
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) onStoreChange();
    };
    const handleLocalChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === key) onStoreChange();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(TRACKING_CHANGED_EVENT, handleLocalChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(TRACKING_CHANGED_EVENT, handleLocalChange);
    };
  }, [key]);
  const getSnapshot = React.useCallback(
    () => key ? window.localStorage.getItem(key) : null,
    [key],
  );
  const stored = React.useSyncExternalStore(subscribe, getSnapshot, () => null);
  const activeUpload = React.useMemo(() => parseTrackingRecord(stored), [stored]);
  const setActiveUpload = React.useCallback((upload: BulkUploadTrackingRecord | null) => {
    if (!key) return;
    if (upload) {
      window.localStorage.setItem(key, JSON.stringify(upload));
    } else {
      window.localStorage.removeItem(key);
    }
    window.dispatchEvent(new CustomEvent(TRACKING_CHANGED_EVENT, { detail: key }));
  }, [key]);

  return [activeUpload, setActiveUpload] as const;
};

const Products = () => {
  const t = useTranslations('products');
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);
  const [isTypeChooserOpen, setIsTypeChooserOpen] = React.useState(false);
  const [activeUpload, setActiveUpload] = useBulkUploadTracking(storeId);

  const handleUploadQueued = React.useCallback((
    upload: BulkUploadProductsResponse,
    fileName: string,
  ) => {
    setActiveUpload({
      jobId: upload.jobId,
      fileName,
      totalRows: upload.totalRows,
      estimatedProducts: upload.estimatedProducts,
      queuedAt: Date.now(),
    });
  }, [setActiveUpload]);

  const handleUploadAnother = React.useCallback(() => {
    setActiveUpload(null);
    setIsBulkDialogOpen(true);
  }, [setActiveUpload]);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Heading title={t('title')} />
        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            leftIcon={<Upload size={16} />}
            onClick={() => setIsBulkDialogOpen(true)}
            disabled={Boolean(activeUpload)}
          >
            {t('bulkUpload.button')}
          </AppButton>
          <AppButton
            leftIcon={<CirclePlus size={16} />}
            onClick={() => setIsTypeChooserOpen(true)}
          >
            {t('addProductButton')}
          </AppButton>
        </div>
      </div>
      {activeUpload ? (
        <BulkProductUploadStatus
          upload={activeUpload}
          onDismiss={() => setActiveUpload(null)}
          onUploadAnother={handleUploadAnother}
        />
      ) : null}
      <div>
        <ProductsTabs />
      </div>
      <ProductTypeChooserDialog
        open={isTypeChooserOpen}
        onClose={() => setIsTypeChooserOpen(false)}
        onSelect={(type) =>
          router.push(
            `${getStorePath(
              storeId,
              '/product-management/products/add-product',
            )}?type=${type}`,
          )
        }
      />
      <BulkProductUploadDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        storeId={storeId}
        onUploadQueued={handleUploadQueued}
      />
    </div>
  );
};

export default Products;
