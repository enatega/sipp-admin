import { ReactNode } from 'react';
import { RiderFormProvider } from '@/contexts/super-admin/enatega-deliveries/rider/rider-form-context';

export default function Layout({ children }: { children: ReactNode }) {
  return <RiderFormProvider>{children}</RiderFormProvider>;
}
