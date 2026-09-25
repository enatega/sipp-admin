'use client';

import { usePathname } from 'next/navigation';
import { AdminBrandingProvider } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { getLegacyStoreSuffixFromPath, getStoreIdFromPath } from '@/lib/store';
import { ProtectedRoute } from '@/components/hoc/ProtectedRoute';
import StoreLayout from '@/components/layouts/store/deliveries';
import { LegacyStoreRouteRedirect } from './LegacyStoreRouteRedirect';

function StoreRouteBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const legacySuffix = getLegacyStoreSuffixFromPath(pathname);

  if (legacySuffix !== null) {
    return <LegacyStoreRouteRedirect suffix={legacySuffix} />;
  }

  const storeId = getStoreIdFromPath(pathname);
  const permission = pathname.includes('/rating-reviews')
    ? 'general-delivery.store_reviews'
    : pathname.includes('/wallet/earning-reports')
      ? 'general-delivery.earning'
      : pathname.includes('/wallet/withdrawal-requests')
        ? 'general-delivery.withdrawal_requests'
        : undefined;

  return (
    <ProtectedRoute role="store" storeId={storeId} permission={permission}>
      <AdminBrandingProvider>
        <StoreLayout>{children}</StoreLayout>
      </AdminBrandingProvider>
    </ProtectedRoute>
  );
}

export { StoreRouteBoundary };
