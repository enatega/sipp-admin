'use client';

import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShimmerTable } from '@/components/ui/shimmer';

// Lazy load RiderStatusTabs for better performance
const RiderStatusTabs = dynamic(
  () =>
    import('@/components/super-admin/enatega-deliveries/rider/main/status-tabs/RiderStatusTabs'),
  {
    loading: () => <ShimmerTable rows={10} columns={7} showHeader={false} />,
  }
);

const Riders = () => {
  const t = useTranslations('driverManagement');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <Heading title={t('ridersPageTitle')} />
        <Link
          href="/enatega-deliveries/riders/add-rider"
        >
          <AppButton leftIcon={<CirclePlus size={16} />}>
            {t('addRiderButton')}
          </AppButton>
        </Link>
      </div>
      <div>
        <RiderStatusTabs />
      </div>
    </div>
  );
};

export default Riders;
