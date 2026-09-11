'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShimmerMap } from '@/components/ui/shimmer';
import {
  useGetDeliveryLiveTrackingRiderDetails,
  useGetDeliveryLiveTrackingRiderOverview,
  useGetDeliveryLiveTrackingRiders,
  useGetDeliveryLiveTrackingRidersMap,
} from '@/hooks/api/super-admin/enatega-deliveries/live-tracking';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import type {
  GetDeliveryLiveTrackingRiderDetailsResponse,
  GetDeliveryLiveTrackingRidersMapResponse,
  GetDeliveryLiveTrackingRidersResponse,
} from '@/types';
import { OrderDetailsSheet } from './OrderDetailsSheet';
import { RiderCard } from './RiderCard';
import type { RiderTrackingItem, RiderTrackingStatus } from './types';
import { useQueryClient } from '@tanstack/react-query';

const LiveTrackingMap = dynamic(
  () =>
    import('./LiveTrackingMap').then((mod) => ({
      default: mod.LiveTrackingMap,
    })),
  {
    loading: () => <ShimmerMap className="h-[640px] w-full" showMarker />,
    ssr: false,
  },
);

const isTrackingStatus = (value: string): value is RiderTrackingStatus =>
  value === 'active' || value === 'busy' || value === 'offline';

type RiderLocationUpdatedAdminPayload = {
  riderUserId: string;
  customerUserId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
};

const mapToTrackingItem = (input: {
  riderId: string;
  riderName: string;
  riderImage: string;
  riderPhone?: string | null;
  riderEmail?: string | null;
  rating: number;
  totalReviews: number;
  status: string;
  isOnline?: boolean | null;
  availabilityStatus?: string | null;
  riderStatus?: string | null;
  storeName?: string | null;
  vendorName?: string | null;
  lastLocationUpdatedLabel?: string | null;
  latitude: number | null;
  longitude: number | null;
  activeOrder: {
    orderId: string;
    customerName: string;
    customerAddress: string;
    orderStatus: string;
    createdAt: string;
  } | null;
}): RiderTrackingItem => ({
  id: input.riderId,
  riderName: input.riderName,
  riderAvatar: input.riderImage || 'https://placehold.co/400x400.png',
  riderPhone: input.riderPhone || 'Not available',
  riderEmail: input.riderEmail || null,
  riderRating: Number(input.rating || 0),
  riderReviews: input.totalReviews || 0,
  isOnline: input.isOnline ?? null,
  availabilityStatus: input.availabilityStatus ?? null,
  riderStatus: input.riderStatus ?? null,
  storeName: input.storeName ?? null,
  vendorName: input.vendorName ?? null,
  trackingStatus: isTrackingStatus(input.status) ? input.status : 'offline',
  lastUpdatedLabel: input.lastLocationUpdatedLabel || 'Not available',
  coords:
    input.latitude !== null && input.longitude !== null
      ? { lat: input.latitude, lng: input.longitude }
      : null,
  order: input.activeOrder
    ? {
        orderId: input.activeOrder.orderId,
        customerName: input.activeOrder.customerName,
        customerAddress: input.activeOrder.customerAddress,
        statusLabel: input.activeOrder.orderStatus,
        createdAt: input.activeOrder.createdAt,
      }
    : null,
});

export function EnategaLiveTrackingOverviewPage() {
  const tSidebar = useTranslations('sidebar');
  const { getParam, setParams } = useQueryParams();
  const { socket, connected } = useSocket(undefined, { namespace: 'deliveries' });
  const userId = getUser()?.id ?? null;
  const queryClient = useQueryClient();

  const [query, setQuery] = useState<string>(() => getParam('search') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | RiderTrackingStatus>(
    () => {
      const rawStatus = getParam('status') || getParam('tab') || '';
      return isTrackingStatus(rawStatus) ? rawStatus : 'all';
    },
  );
  const [realtimeLocations, setRealtimeLocations] = useState<
    Record<string, { lat: number; lng: number; timestamp?: number }>
  >({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const {
    data: liveTrackingData,
    isLoading,
    isFetching,
    isError,
  } = useGetDeliveryLiveTrackingRiders();
  const { data: liveTrackingMapData } = useGetDeliveryLiveTrackingRidersMap();

  // Socket emits `riderUserId`, but our map/list items are keyed by `riderId`.
  // Build a lookup so we can translate the socket payload to the correct marker id.
  const riderUserIdToRiderId = useMemo<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    for (const rider of liveTrackingData?.data || []) {
      if (rider.riderUserId && rider.riderId) {
        next[rider.riderUserId] = rider.riderId;
      }
    }
    return next;
  }, [liveTrackingData?.data]);

  // Socket events can arrive before the list/map loads. In that case we store updates keyed
  // by `riderUserId`. Once we know the mapping to `riderId`, we expose a normalized view
  // that also contains entries keyed by `riderId` (without mutating state inside an effect).
  const normalizedRealtimeLocations = useMemo(() => {
    const next = { ...realtimeLocations };
    for (const [userId, riderId] of Object.entries(riderUserIdToRiderId)) {
      if (next[userId] && !next[riderId]) {
        next[riderId] = next[userId];
      }
    }
    return next;
  }, [realtimeLocations, riderUserIdToRiderId]);

  useEffect(() => {
    if (!connected || !userId) return;
    socket.emit('add-user', userId);
  }, [connected, socket, userId]);

  useEffect(() => {
    const handler = (payload: RiderLocationUpdatedAdminPayload) => {
      if (!payload?.riderUserId) return;
      if (
        typeof payload.latitude !== 'number' ||
        typeof payload.longitude !== 'number'
      ) {
        return;
      }

      const riderIdFromUserId = riderUserIdToRiderId[payload.riderUserId];
      const keys = Array.from(
        new Set([payload.riderUserId, riderIdFromUserId].filter(Boolean)),
      ) as string[];

      setRealtimeLocations((prev) => ({
        ...prev,
        ...Object.fromEntries(
          keys.map((key) => [
            key,
            {
              lat: payload.latitude,
              lng: payload.longitude,
              timestamp: payload.timestamp,
            },
          ]),
        ),
      }));

      // Update react-query caches so other components stay consistent.
      queryClient.setQueriesData<GetDeliveryLiveTrackingRidersMapResponse>(
        { queryKey: ['delivery-live-tracking-riders-map'], exact: false },
        (current) => {
          if (!current) return current;
          const updatedMarkers = (current.markers || []).map((m) => {
            if (!keys.includes(m.riderId)) return m;
            return { ...m, latitude: payload.latitude, longitude: payload.longitude };
          });
          return { ...current, markers: updatedMarkers };
        },
      );

      queryClient.setQueriesData<GetDeliveryLiveTrackingRidersResponse>(
        { queryKey: ['delivery-live-tracking-riders'], exact: false },
        (current) => {
          if (!current) return current;
          const updated = (current.data || []).map((r) => {
            if (!keys.includes(r.riderId) && !keys.includes(r.riderUserId ?? '')) return r;
            return { ...r, latitude: payload.latitude, longitude: payload.longitude };
          });
          return { ...current, data: updated };
        },
      );

      if (riderIdFromUserId) {
        queryClient.setQueryData<GetDeliveryLiveTrackingRiderDetailsResponse>(
          ['delivery-live-tracking-rider-details', riderIdFromUserId],
          (current) => {
            if (!current) return current;
            return {
              ...current,
              rider: {
                ...current.rider,
                latitude: payload.latitude,
                longitude: payload.longitude,
              },
            };
          },
        );
      }
    };

    socket.on('get-rider-location-admin', handler);
    return () => {
      socket.off('get-rider-location-admin', handler);
    };
  }, [queryClient, riderUserIdToRiderId, socket]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams({ search: query.trim() || null, page: '1' });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, setParams]);

  useEffect(() => {
    setParams({
      status: statusFilter === 'all' ? null : statusFilter,
      page: '1',
    });
  }, [setParams, statusFilter]);

  const items = useMemo<RiderTrackingItem[]>(() => {
    const base = (liveTrackingData?.data || []).map((rider) =>
      mapToTrackingItem({
        riderId: rider.riderId,
        riderName: rider.riderName,
        riderImage: rider.riderImage,
        riderPhone: rider.riderPhone,
        riderEmail: rider.riderEmail,
        rating: rider.rating,
        totalReviews: rider.totalReviews,
        status: rider.status,
        isOnline: rider.isOnline,
        availabilityStatus: rider.availabilityStatus,
        riderStatus: rider.riderStatus,
        storeName: rider.storeName,
        vendorName: rider.vendorName,
        lastLocationUpdatedLabel: rider.lastLocationUpdatedLabel,
        latitude: rider.latitude,
        longitude: rider.longitude,
        activeOrder: rider.activeOrder,
      }),
    );

    return base.map((item) => {
      const live = normalizedRealtimeLocations[item.id];
      if (!live) return item;
      return { ...item, coords: { lat: live.lat, lng: live.lng } };
    });
  }, [liveTrackingData, normalizedRealtimeLocations]);

  const mapItems = useMemo<RiderTrackingItem[]>(() => {
    const base = (liveTrackingMapData?.markers || []).map((marker) =>
      mapToTrackingItem({
        riderId: marker.riderId,
        riderName: marker.riderName,
        riderImage: marker.riderImage,
        riderPhone: null,
        riderEmail: null,
        rating: marker.rating,
        totalReviews: marker.totalReviews,
        status: marker.status,
        isOnline: null,
        availabilityStatus: null,
        riderStatus: null,
        storeName: null,
        vendorName: null,
        lastLocationUpdatedLabel: null,
        latitude: marker.latitude,
        longitude: marker.longitude,
        activeOrder: marker.activeOrder,
      }),
    );

    return base.map((item) => {
      const live = normalizedRealtimeLocations[item.id];
      if (!live) return item;
      return { ...item, coords: { lat: live.lat, lng: live.lng } };
    });
  }, [liveTrackingMapData, normalizedRealtimeLocations]);

  const selectedRiderId = useMemo(() => {
    if (
      selectedId &&
      (items.some((item) => item.id === selectedId) ||
        mapItems.some((item) => item.id === selectedId))
    ) {
      return selectedId;
    }

    return items[0]?.id ?? mapItems[0]?.id ?? null;
  }, [items, mapItems, selectedId]);
  const { data: selectedRiderDetailsData } =
    useGetDeliveryLiveTrackingRiderDetails(selectedRiderId);
  const {
    data: selectedRiderOverviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useGetDeliveryLiveTrackingRiderOverview(selectedRiderId, {
    enabled: Boolean(selectedRiderId) && detailsOpen,
  });

  const selectedListOrMapItem: RiderTrackingItem | null =
    items.find((item) => item.id === selectedRiderId) ??
    mapItems.find((item) => item.id === selectedRiderId) ??
    items[0] ??
    mapItems[0] ??
    null;

  const selectedItem: RiderTrackingItem | null = useMemo(() => {
    const details = selectedRiderDetailsData?.rider;
    if (!details) {
      return selectedListOrMapItem;
    }

    return mapToTrackingItem({
      riderId: details.riderId,
      riderName: details.riderName,
      riderImage: details.riderImage,
      riderPhone: details.riderPhone,
      riderEmail: details.riderEmail,
      rating: details.rating,
      totalReviews: details.totalReviews,
      status: details.status,
      isOnline: details.isOnline,
      availabilityStatus: details.availabilityStatus,
      riderStatus: details.riderStatus,
      storeName: details.storeName,
      vendorName: details.vendorName,
      lastLocationUpdatedLabel: details.lastLocationUpdatedLabel,
      latitude: details.latitude,
      longitude: details.longitude,
      activeOrder: details.activeOrder,
    });
  }, [selectedListOrMapItem, selectedRiderDetailsData]);

  const statusCounts = liveTrackingMapData?.statusCounts || liveTrackingData?.statusCounts;
  const statusFilters: Array<{ label: string; value: 'all' | RiderTrackingStatus }> = [
    {
      label: `All Riders (${statusCounts?.all ?? items.length})`,
      value: 'all',
    },
    {
      label: `Active (${statusCounts?.active ?? 0})`,
      value: 'active',
    },
    {
      label: `Busy (${statusCounts?.busy ?? 0})`,
      value: 'busy',
    },
    {
      label: `Offline (${statusCounts?.offline ?? 0})`,
      value: 'offline',
    },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Heading title={tSidebar('liveTracking')} containerClassName="mb-0" />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="w-full shrink-0 xl:w-[340px]">
          <div className="rounded-[16px] border border-sidebar-border bg-card p-4 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">
                All Riders
              </h3>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search riders or order ID..."
                  className="h-10 rounded-lg pl-9"
                />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === filter.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
              {(isLoading || isFetching) && items.length === 0 && (
                <div className="rounded-xl border border-dashed border-sidebar-border bg-accent/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  Loading riders...
                </div>
              )}

              {!isLoading &&
                items.map((item) => (
                  <RiderCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}

              {!isLoading && !isError && items.length === 0 && (
                <div className="rounded-xl border border-dashed border-sidebar-border bg-accent/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  No riders found.
                </div>
              )}

              {isError && (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">
                  Failed to load live tracking riders.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[16px] border border-sidebar-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sidebar-border px-6 py-4">
              <h3 className="text-[18px] font-bold text-foreground">Map View</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-orange-200 bg-orange-50 px-3 text-orange-600 hover:bg-orange-100"
                  onClick={() => setDetailsOpen(true)}
                  disabled={!selectedItem}
                >
                  View Order Details
                </Button>
              </div>
            </div>

            <LiveTrackingMap
              items={mapItems}
              selectedId={selectedItem?.id ?? null}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>

      <OrderDetailsSheet
        item={selectedItem}
        overview={selectedRiderOverviewData}
        isOverviewLoading={isOverviewLoading}
        isOverviewError={isOverviewError}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
