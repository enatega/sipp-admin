import { ReactNode } from 'react';
import { VendorFormProvider } from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';

export default function Layout({ children }: { children: ReactNode }) {
  return <VendorFormProvider>{children}</VendorFormProvider>;
}
