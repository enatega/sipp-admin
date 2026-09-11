'use client';

import { usePathname } from 'next/navigation';
import { AdminBrandingProvider } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { ProtectedRoute } from '@/components/hoc/ProtectedRoute';
import VendorLayout from '@/components/layouts/vendor/deliveries';

function VendorRouteBoundary({
  children,
  vendorId,
}: {
  children: React.ReactNode;
  vendorId: string;
}) {
  const pathname = usePathname();
  const permission = pathname.includes('/rating-reviews')
    ? 'general-delivery.store_reviews'
    : undefined;

  return (
    <ProtectedRoute role="vendor" vendorId={vendorId} permission={permission}>
      <AdminBrandingProvider>
        <VendorLayout>{children}</VendorLayout>
      </AdminBrandingProvider>
    </ProtectedRoute>
  );
}

export { VendorRouteBoundary };
