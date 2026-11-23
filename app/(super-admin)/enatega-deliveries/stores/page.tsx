import { Suspense } from 'react';
import EnategaLoader from '@/components/shared/EnategaLoader';
import { Stores } from '@/components/super-admin/enatega-deliveries/stores';

export default function StoresPage() {
  return (
    <Suspense fallback={<EnategaLoader />}>
      <Stores />
    </Suspense>
  );
}
