import type { Metadata } from 'next';
import { deployment } from '@/config/deployment';
import { AdminBrandingProvider } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { BulkImageUploadHeader } from '@/components/bulk-image-upload/BulkImageUploadHeader';

export const metadata: Metadata = {
  title: `Bulk Image Upload | ${deployment.brand.appName}`,
  // Shared by link only; keep it out of search results.
  robots: { index: false, follow: false },
};

/**
 * Standalone, public layout: no admin login, sidebar or route guard.
 * Access is controlled by the access key set in the admin settings.
 */
export default function BulkImageUploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminBrandingProvider titleOverride={deployment.brand.titles.admin}>
      <div className="min-h-screen bg-light">
        <BulkImageUploadHeader />
        <main>{children}</main>
      </div>
    </AdminBrandingProvider>
  );
}
