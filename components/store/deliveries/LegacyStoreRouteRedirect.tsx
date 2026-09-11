'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStorePath } from '@/lib/store';
import {
  getAdminProfiles,
  getStoreProfileId,
  getUser,
  getVendorProfileId,
  hasAdminProfile,
} from '@/lib/user';
import EnategaLoader from '@/components/shared/EnategaLoader';

interface LegacyStoreRouteRedirectProps {
  suffix?: string;
}

function LegacyStoreRouteRedirect({
  suffix = '',
}: LegacyStoreRouteRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();

    if (!user?.token) {
      router.replace('/login');
      return;
    }

    const profiles = getAdminProfiles();
    const storeProfileId = getStoreProfileId(profiles);
    const vendorProfileId = getVendorProfileId(profiles);

    if (storeProfileId) {
      router.replace(getStorePath(storeProfileId, suffix));
      return;
    }

    if (vendorProfileId) {
      router.replace(`/vendor/deliveries/${vendorProfileId}/stores`);
      return;
    }

    if (hasAdminProfile(profiles)) {
      router.replace('/enatega-deliveries/stores');
      return;
    }

    router.replace('/login');
  }, [router, suffix]);

  return <EnategaLoader />;
}

export { LegacyStoreRouteRedirect };
