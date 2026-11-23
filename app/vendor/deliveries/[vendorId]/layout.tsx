import { deployment } from '@/config/deployment';
import { VendorRouteBoundary } from '@/components/vendor/deliveries/VendorRouteBoundary';

export const metadata = {
  title: deployment.brand.titles.vendor,
};

export default async function VendorLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  return (
    <VendorRouteBoundary vendorId={vendorId}>{children}</VendorRouteBoundary>
  );
}
