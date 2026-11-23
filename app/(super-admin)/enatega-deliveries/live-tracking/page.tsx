import dynamic from 'next/dynamic';
import { ShimmerMap } from '@/components/ui/shimmer';

const EnategaLiveTrackingOverviewPage = dynamic(
  () =>
    import(
      '@/components/super-admin/enatega-deliveries/live-tracking/overview-page'
    ).then((mod) => mod.EnategaLiveTrackingOverviewPage),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-md bg-accent" />
        <ShimmerMap className="h-[640px] w-full" showMarker />
      </div>
    ),
  },
);

export default function Page() {
  return <EnategaLiveTrackingOverviewPage />;
}
