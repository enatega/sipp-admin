'use client';

import { useParams } from 'next/navigation';
import { StoreMenuEditor } from '@/components/store/deliveries/menu-control/StoreMenuEditor';

export default function MenuControlPage() {
  const { storeId } = useParams() as { storeId: string };
  return <StoreMenuEditor storeId={storeId} />;
}
