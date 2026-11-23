import { Suspense } from 'react';
import EnategaLoader from '@/components/shared/EnategaLoader';
import { VendorStores } from '@/components/vendor/deliveries/stores';

export default function VendorStoresPage() {
  return (
    <Suspense fallback={<EnategaLoader />}>
      <VendorStores />
    </Suspense>
  );
}
