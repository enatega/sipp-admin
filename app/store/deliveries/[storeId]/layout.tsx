import { deployment } from '@/config/deployment';
import { StoreRouteBoundary } from '@/components/store/deliveries/StoreRouteBoundary';

export const metadata = {
  title: deployment.brand.titles.store,
};

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreRouteBoundary>{children}</StoreRouteBoundary>;
}
