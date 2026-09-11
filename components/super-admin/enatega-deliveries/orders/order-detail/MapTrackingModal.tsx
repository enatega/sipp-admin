'use client';

import { AppDialog } from '@/components/shared/AppDialog';
import DisplayError from '@/components/shared/DisplayError';
import { isGoogleMapsRefererNotAllowedError } from '@/lib/googleMaps';
import { useGoogleMapsLoader } from '@/lib/googleMapsLoader';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import type { OrderDetail } from '@/types';
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  OverlayView,
} from '@react-google-maps/api';
import { AlertTriangle, Bike, MapPin, Navigation, Store } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

const normalizeOrderStatus = (status?: string | null) =>
  String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const resolveLatLng = (location: unknown): { lat: number; lng: number } | null => {
  if (!location || typeof location !== 'object') return null;
  const record = location as Record<string, unknown>;
  const lat = toNumber(record.lat) ?? toNumber(record.latitude);
  const lng =
    toNumber(record.lng) ??
    toNumber(record.lon) ??
    toNumber(record.long) ??
    toNumber(record.longitude);

  if (lat == null || lng == null) return null;
  return { lat, lng };
};

type RiderLocationPayload = {
  riderUserId: string;
  customerUserId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
};

interface MapTrackingModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderDetail;
}

export default function MapTrackingModal({
  open,
  onClose,
  order,
}: MapTrackingModalProps) {
  const t = useTranslations('orders.mapTracking');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const { socket, connected } = useSocket(undefined, { namespace: 'deliveries' });
  const userId = getUser()?.id ?? null;

  const pickup = useMemo(
    () =>
      resolveLatLng(order.pickupLocation) ??
      resolveLatLng(order.delivery?.pickupLocation) ??
      resolveLatLng((order as { deliveryInfo?: unknown }).deliveryInfo) ??
      resolveLatLng((order as { deliveryInfo?: { pickupLocation?: unknown } }).deliveryInfo?.pickupLocation) ??
      null,
    [order],
  );
  const dropoff = useMemo(
    () =>
      resolveLatLng(order.dropoffLocation) ??
      resolveLatLng(order.delivery?.deliveryLocation) ??
      resolveLatLng((order as { deliveryInfo?: { deliveryLocation?: unknown } }).deliveryInfo?.deliveryLocation) ??
      resolveLatLng((order as { deliveryInfo?: { dropoffLocation?: unknown } }).deliveryInfo?.dropoffLocation) ??
      null,
    [order],
  );
  const initialRiderLoc = useMemo(
    () =>
      resolveLatLng(order.riderLocation) ??
      resolveLatLng(order.rider?.riderLocation) ??
      null,
    [order],
  );
  const riderUserId = (order.rider as Record<string, unknown> & { riderUserId?: string })?.riderUserId ?? null;

  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(() => initialRiderLoc);
  const [riderDirections, setRiderDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const prevRiderLocRef = useRef<string>('');

  useEffect(() => {
    if (!connected || !userId) return;
    socket.emit('add-user', userId);
  }, [connected, socket, userId]);

  useEffect(() => {
    if (!open) return;

    const handler = (payload: RiderLocationPayload) => {
      if (!payload?.riderUserId) return;
      if (typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') return;

      if (riderUserId && payload.riderUserId !== riderUserId) return;

      const newLoc = { lat: payload.latitude, lng: payload.longitude };
      const key = `${newLoc.lat.toFixed(5)},${newLoc.lng.toFixed(5)}`;
      if (key === prevRiderLocRef.current) return;
      prevRiderLocRef.current = key;

      setRiderLocation(newLoc);
    };

    socket.on('get-rider-location-admin', handler);
    return () => {
      socket.off('get-rider-location-admin', handler);
    };
  }, [open, socket, riderUserId]);

  useEffect(() => {
    if (!riderLocation || !map) return;
    map.panTo(riderLocation);
  }, [riderLocation, map]);

  const orderStatus = normalizeOrderStatus(order.status);
  const riderToDropoffStatuses = new Set([
    'picked_up',
    'out_for_delivery',
    'arrived',
    'delivered',
  ]);
  const liveTrackingStatuses = new Set([
    'rider_assigned',
    'picked_up',
    'out_for_delivery',
    'arrived',
    'delivered',
  ]);

  const isRiderHeadingToDropoff = riderToDropoffStatuses.has(orderStatus);
  const destination = isRiderHeadingToDropoff ? dropoff : pickup;
  const showStatusWarning =
    orderStatus !== '' && !liveTrackingStatuses.has(orderStatus);
  const hasTopInfo = Boolean(order.rider?.name || routeDistance);

  const riderRouteCallback = useCallback(
    (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === 'OK' && result) {
        setRiderDirections(result);
        const leg = result.routes[0]?.legs[0];
        if (leg) {
          setRouteDistance(leg.distance?.text ?? null);
          setRouteDuration(leg.duration?.text ?? null);
        }
      }
    },
    [],
  );

  const center = useMemo(() => {
    if (riderLocation) return riderLocation;
    if (pickup) return pickup;
    if (dropoff) return dropoff;
    return { lat: 33.6844, lng: 73.0479 };
  }, [riderLocation, pickup, dropoff]);

  const showRiderDirections = riderLocation && destination;
  const isSamePickupAndDropoff = Boolean(
    pickup &&
      dropoff &&
      Math.abs(pickup.lat - dropoff.lat) < 0.000001 &&
      Math.abs(pickup.lng - dropoff.lng) < 0.000001,
  );

  if (!open) return null;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('title')}
      description={t('description')}
      size="7xl"
      showDefaultFooter={false}
      bodyClassName="!p-0 !m-0"
      contentClassName="!max-h-[90vh]"
    >
      <div className="flex flex-col h-[75vh]">
        {hasTopInfo && (
          <div className="flex items-center gap-4 px-6 py-3 bg-white border-b">
            {order.rider?.name && (
              <div className="flex items-center gap-2 text-sm">
                <Bike className="h-4 w-4 text-primary" />
                <span className="font-medium">{order.rider.name}</span>
                {order.rider.phone && (
                  <span className="text-muted-foreground">({order.rider.phone})</span>
                )}
              </div>
            )}
            {routeDistance && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    {isRiderHeadingToDropoff ? 'Rider → Dropoff' : 'Rider → Pickup'}
                  </span>
                </div>
                <span>{routeDistance}</span>
                {routeDuration && <span>· {routeDuration}</span>}
              </div>
            )}
          </div>
        )}

        {showStatusWarning && (
          <div
            className={`mx-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2 ${
              hasTopInfo ? 'mt-3' : 'my-3'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Live tracking directions are only supported for `rider_assigned`,
              `picked_up`, `out_for_delivery`, `arrived`, and `delivered`.
              Markers are shown for the current order.
            </span>
          </div>
        )}

        <div className="flex-1 relative">
          {!googleMapsApiKey ? (
            <div className="flex items-center justify-center h-full bg-muted/30">
              <DisplayError
                title={t('missingApiKeyTitle')}
                message={t('missingApiKeyMessage')}
              />
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center h-full bg-muted/30">
              <DisplayError
                title={
                  isGoogleMapsRefererNotAllowedError(loadError)
                    ? t('refererNotAllowedTitle')
                    : t('loadFailedTitle')
                }
                message={
                  isGoogleMapsRefererNotAllowedError(loadError)
                    ? t('refererNotAllowedMessage')
                    : t('loadFailedMessage')
                }
              />
            </div>
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={(instance) => setMap(instance)}
              onUnmount={() => setMap(null)}
              options={{ disableDefaultUI: false, zoomControl: true }}
            >
              {showRiderDirections && !riderDirections && (
                <DirectionsService
                  options={{
                    origin: riderLocation!,
                    destination: destination!,
                    travelMode: google.maps.TravelMode.DRIVING,
                  }}
                  callback={riderRouteCallback}
                />
              )}
              {riderDirections && (
                <DirectionsRenderer
                  directions={riderDirections}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#3b82f6',
                      strokeWeight: 5,
                      strokeOpacity: 0.8,
                    },
                    preserveViewport: true,
                  }}
                />
              )}

              {pickup && (
                <OverlayView
                  position={pickup}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={() =>
                    isSamePickupAndDropoff ? { x: -18, y: -16 } : { x: 0, y: 0 }
                  }
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-500 rounded-full p-2 shadow-lg border-2 border-white">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-2 w-2 rotate-45 -mt-1 bg-emerald-500" />
                    <span className="mt-1 text-[10px] font-medium bg-white px-1.5 py-0.5 rounded shadow-sm text-foreground whitespace-nowrap">
                      Pickup
                    </span>
                  </div>
                </OverlayView>
              )}

              {dropoff && (
                <OverlayView
                  position={dropoff}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={() =>
                    isSamePickupAndDropoff ? { x: 18, y: -16 } : { x: 0, y: 0 }
                  }
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-red-500 rounded-full p-2 shadow-lg border-2 border-white">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-2 w-2 rotate-45 -mt-1 bg-red-500" />
                    <span className="mt-1 text-[10px] font-medium bg-white px-1.5 py-0.5 rounded shadow-sm text-foreground whitespace-nowrap">
                      Dropoff
                    </span>
                  </div>
                </OverlayView>
              )}

              {riderLocation && (
                <OverlayView
                  position={riderLocation}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                      <div className="relative bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white">
                        <Bike className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="h-2 w-2 rotate-45 -mt-1 bg-blue-500" />
                    <span className="mt-1 text-[10px] font-medium bg-blue-500 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {order.rider?.name ?? 'Rider'}
                    </span>
                  </div>
                </OverlayView>
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-md">
              <span className="text-muted-foreground">{t('loading')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
          <div className="flex items-center gap-4">
            {pickup && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Pickup</span>
              </div>
            )}
            {dropoff && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Dropoff</span>
              </div>
            )}
            {riderLocation && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Rider (live)</span>
              </div>
            )}
          </div>
          {routeDistance && routeDuration && (
            <div className="text-xs text-muted-foreground">
              ETA: <span className="font-medium text-foreground">{routeDuration}</span>
              {' · '}
              Distance: <span className="font-medium text-foreground">{routeDistance}</span>
            </div>
          )}
        </div>
      </div>
    </AppDialog>
  );
}
