import { deployment } from '@/config/deployment';
import { AdminBrandingProvider } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminBrandingProvider titleOverride={deployment.brand.titles.auth}>
      {children}
    </AdminBrandingProvider>
  );
}
