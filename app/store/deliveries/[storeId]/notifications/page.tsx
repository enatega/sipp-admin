'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { StoreNotificationCenter } from '@/components/store/deliveries/notifications/StoreNotificationCenter';
import { useStoreOwnerSession } from '@/hooks/use-store-owner-session';

export default function StoreNotificationsPage() {
  const t = useTranslations('storeNotifications');
  const params = useParams();
  const rawStoreId = params.storeId;
  const storeId = Array.isArray(rawStoreId) ? rawStoreId[0] : rawStoreId;
  const isStoreOwner = useStoreOwnerSession(storeId);

  if (!storeId) return null;
  if (!isStoreOwner) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-600">
        {t('storeAccountOnly')}
      </div>
    );
  }
  return <StoreNotificationCenter storeId={storeId} />;
}
