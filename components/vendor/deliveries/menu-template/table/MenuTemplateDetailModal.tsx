'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AppDialog } from '@/components/shared/AppDialog';
import Status from '@/components/shared/Status';
import { Switch } from '@/components/ui/switch';
import { VendorMenuTemplateItem } from './types';

interface MenuTemplateDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: VendorMenuTemplateItem | null;
}

export default function MenuTemplateDetailModal({
  open,
  onClose,
  item,
}: MenuTemplateDetailModalProps) {
  const t = useTranslations('vendorMenuTemplate.detail');

  if (!item) return null;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('title')}
      size="4xl"
      showDefaultFooter={false}
    >
      <div className="bg-white border rounded-md p-6 space-y-6">
        <h2 className="text-2xl font-semibold">{item.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-mute">{t('description')}</p>
            <p className="text-base mt-1">{item.description}</p>
          </div>
          <div>
            <p className="text-sm text-mute">{t('products')}</p>
            <p className="text-base mt-1">{item.totalProducts}</p>
          </div>
          <div>
            <p className="text-sm text-mute">{t('status')}</p>
            <div className="mt-2 flex gap-2">
              <Status status={item.isActive ? 'active' : 'inactive'} />
              <Status
                status={item.availability ? 'active' : 'inactive'}
                label={item.availability ? t('available') : t('unavailable')}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-mute">{t('assignedStores')}</p>
            <p className="text-base mt-1">{item.assignedStores.length}</p>
          </div>
          <div>
            <p className="text-sm text-mute">{t('availability')}</p>
            <div className="mt-3">
              <Switch checked={item.availability} disabled />
            </div>
          </div>
          <div>
            <p className="text-sm text-mute">{t('createdAt')}</p>
            <p className="text-base mt-1">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {item.assignedStores.length > 0 && (
          <div>
            <p className="text-sm text-mute mb-3">{t('storeAssignments')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {item.assignedStores.map((store) => (
                <div
                  key={store.id}
                  className="border rounded-md p-4 flex items-center gap-3"
                >
                  {store.image ? (
                    <Image
                      src={store.image}
                      alt={store.name}
                      width={44}
                      height={44}
                      className="size-11 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="size-11 rounded-md bg-accent" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{store.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {store.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.imageUrl && (
          <div className="relative w-full h-[320px] rounded-md border overflow-hidden">
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          </div>
        )}
      </div>
    </AppDialog>
  );
}
