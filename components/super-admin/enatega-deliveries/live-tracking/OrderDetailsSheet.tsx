'use client';
import { AddressDetailsView } from '@/components/shared/AddressDetailsView';

import { CalendarDays, MapPin, Phone, Store, User } from 'lucide-react';
import type { GetDeliveryLiveTrackingRiderOverviewResponse } from '@/types';
import type { RiderTrackingItem } from './types';
import { useCurrency } from '@/hooks/use-currency';
import Status from '@/components/shared/Status';
import { MapLoadingState, OrderRouteMap } from './OrderRouteMap';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface OrderDetailsSheetProps {
  item: RiderTrackingItem | null;
  overview: GetDeliveryLiveTrackingRiderOverviewResponse | undefined;
  isOverviewLoading: boolean;
  isOverviewError: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toLatLng = (lat?: number | null, lng?: number | null) =>
  typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

export function OrderDetailsSheet({
  item,
  overview,
  isOverviewLoading,
  isOverviewError,
  open,
  onOpenChange,
}: OrderDetailsSheetProps) {
  const { currencySymbol } = useCurrency();
  if (!item) {
    return null;
  }

  const routeSnapshot = overview?.routeSnapshot;
  const pickupCoords = toLatLng(
    routeSnapshot?.pickupLatitude,
    routeSnapshot?.pickupLongitude,
  );
  const dropoffCoords = toLatLng(
    routeSnapshot?.dropoffLatitude,
    routeSnapshot?.dropoffLongitude,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        key={item.id}
        className="overflow-y-auto p-0 sm:max-w-[540px]"
      >
        <SheetHeader className="border-b bg-white px-6 py-5">
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            Review the selected rider&apos;s active delivery information.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 bg-muted/20 p-6">
          {isOverviewLoading && (
            <section className="rounded-xl border border-sidebar-border bg-white p-4 text-sm text-muted-foreground">
              Loading rider overview...
            </section>
          )}

          {isOverviewError && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Failed to load rider overview.
            </section>
          )}

          <section className="space-y-4 rounded-xl border border-sidebar-border bg-white p-4">
            <h4 className="text-sm font-semibold text-foreground">
              Rider Information
            </h4>
            <DetailRow
              label="Rider Name"
              value={overview?.rider.riderName || item.riderName}
            />
            <DetailRow
              label="Phone Number"
              value={overview?.rider.riderPhone || item.riderPhone}
            />
            <DetailRow
              label="Rider Type"
              value={overview?.rider.riderType || 'Not available'}
            />
            <DetailRow
              label="Vehicle Type"
              value={overview?.rider.vehicleType || 'Not available'}
            />
          </section>

          <section className="space-y-4 rounded-xl border border-sidebar-border bg-white p-4">
            <h4 className="text-sm font-semibold text-foreground">
              Active Order
            </h4>
            {overview?.activeOrder ? (
              <>
                <DetailRow
                  label="Order ID"
                  value={
                    <span
                      title={overview.activeOrder.orderId}
                      className="font-semibold tracking-wide text-primary"
                    >
                      #{overview.activeOrder.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  }
                />
                <DetailRow
                  label="Customer"
                  value={overview.activeOrder.customerName}
                />
                <DetailRow
                  label="Status"
                  value={<Status status={overview.activeOrder.status} />}
                />
                <DetailRow
                  label="Amount"
                  value={`${currencySymbol} ${overview.activeOrder.amount}`}
                />
                <DetailRow
                  label="Payment Method"
                  value={overview.activeOrder.paymentMethod === 'wallet_card'
                    ? 'Wallet + Card'
                    : overview.activeOrder.paymentMethod}
                />
                <DetailRow
                  label="Placed At"
                  value={overview.activeOrder.placedAt}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active order currently assigned to this rider.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-sidebar-border bg-white p-4">
            <h4 className="text-sm font-semibold text-foreground">
              Route Snapshot
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Store className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {overview?.routeSnapshot?.pickupAddress || 'No pickup address'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {overview?.routeSnapshot?.dropoffAddress ||
                    'No dropoff address'}
                </span>
              </p>
              <AddressDetailsView className="ps-6 text-foreground" isHistoricalFallback={overview?.routeSnapshot?.deliveryAddressIsHistoricalFallback} details={overview?.routeSnapshot?.deliveryAddressDetails} legacyText={overview?.routeSnapshot?.deliveryAddressExtras} />
              <p className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  {overview?.routeSnapshot?.customerName || 'Not available'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  {overview?.routeSnapshot?.customerPhone || item.riderPhone}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  {overview?.routeSnapshot?.lastLocationUpdatedLabel ||
                    item.lastUpdatedLabel}
                </span>
              </p>
            </div>
          </section>

          {isOverviewLoading && (
            <section className="space-y-3 rounded-xl border border-sidebar-border bg-white p-4">
              <h4 className="text-sm font-semibold text-foreground">
                Live Tracking
              </h4>
              <MapLoadingState />
            </section>
          )}

          {!isOverviewLoading && overview?.activeOrder && (
            <section className="space-y-3 rounded-xl border border-sidebar-border bg-white p-4">
              <h4 className="text-sm font-semibold text-foreground">
                Live Tracking
              </h4>
              <OrderRouteMap
                pickup={pickupCoords}
                dropoff={dropoffCoords}
                rider={item.coords}
                riderName={overview.rider.riderName || item.riderName}
                orderStatus={overview.activeOrder.status}
              />
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
