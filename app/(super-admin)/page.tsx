'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirstAccessibleRoute } from '@/config/sidebar';
import EnategaLoader from '@/components/shared/EnategaLoader';

// Login and the logo land here; send the user to the first page their role can
// open rather than the dashboard, which restricted roles cannot load.
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getFirstAccessibleRoute());
  }, [router]);

  return <EnategaLoader />;
}
