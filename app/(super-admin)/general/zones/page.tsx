'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { ShimmerTable } from '@/components/ui/shimmer';

// Lazy load ZonesTabs for better performance
const ZonesTabs = dynamic(
  () =>
    import('@/components/super-admin/general/zones/ZonesTabs').then((mod) => ({
      default: mod.ZonesTabs,
    })),
  {
    loading: () => <ShimmerTable rows={8} columns={5} />,
  },
);

export default function ZonesPage() {
  const t = useTranslations('zones');

  return (
    <div className="space-y-4">
      {/* <Heading title={t('title')} /> */}
      <ZonesTabs />
    </div>
  );
}
