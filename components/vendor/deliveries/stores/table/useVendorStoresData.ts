'use client';

import { useMemo } from 'react';
import { useGetVendorStores } from '@/hooks/api/vendor/deliveries/stores';
import { DeliveryStore } from '@/types/entities/super-admin/enatega-deliveries/stores';
import { VendorStoreTableItem } from './types';

export const mapVendorStoreToRow = (store: DeliveryStore): VendorStoreTableItem => ({
  id: store.id,
  name: store.storename,
  email: store.storeemail,
  address: store.address ?? '',
  logo: store.storeimage || null,
  shopTypeId: store.shoptypeid,
  shopTypeName: store.shoptypename,
  zoneName: store.zonename,
  status: store.status,
  isAvailable: store.isavailable,
  isBlocked: store.isblocked,
  isActive: store.isactive,
  createdAt: store.createdat,
  activeOrders: Number(store.activeorders || 0),
  totalOrders: Number(store.totalorders || 0),
  rating: Number(store.averagerating || 0),
});

export function useVendorStoresData() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetVendorStores();

  const stores = useMemo(
    () => data?.data?.map(mapVendorStoreToRow) || [],
    [data?.data],
  );

  return {
    stores,
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
