import { deployment } from '@/config/deployment';
import { AdminBrandingProvider } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { ProtectedRoute } from '@/components/hoc/ProtectedRoute';
import MainLayout from '@/components/layouts/super-admin';

export const metadata = {
  title: deployment.brand.titles.admin,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <AdminBrandingProvider>
        <MainLayout>{children}</MainLayout>
      </AdminBrandingProvider>
    </ProtectedRoute>
  );
}
