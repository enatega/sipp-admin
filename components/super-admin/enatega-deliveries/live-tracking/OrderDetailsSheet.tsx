'use client';

import { CalendarDays, MapPin, Phone, Store, User } from 'lucide-react';
import type { GetDeliveryLiveTrackingRiderOverviewResponse } from '@/types';
import type { RiderTrackingItem } from './types';
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
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
  if (!item) {
    return null;
  }

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
            <DetailRow
              label="Rating"
              value={`${Number(overview?.rider.rating ?? item.riderRating).toFixed(1)} (${overview?.rider.totalReviews ?? item.riderReviews} reviews)`}
            />
          </section>

          <section className="space-y-4 rounded-xl border border-sidebar-border bg-white p-4">
            <h4 className="text-sm font-semibold text-foreground">
              Active Order
            </h4>
            {overview?.activeOrder ? (
              <>
                <DetailRow label="Order ID" value={overview.activeOrder.orderId} />
                <DetailRow
                  label="Customer"
                  value={overview.activeOrder.customerName}
                />
                <DetailRow label="Status" value={overview.activeOrder.status} />
                <DetailRow
                  label="Amount"
                  value={`${overview.activeOrder.amount}`}
                />
                <DetailRow
                  label="Payment Method"
                  value={overview.activeOrder.paymentMethod}
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
                <span>
                  {overview?.routeSnapshot?.pickupAddress || 'No pickup address'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  {overview?.routeSnapshot?.dropoffAddress ||
                    'No dropoff address'}
                </span>
              </p>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
