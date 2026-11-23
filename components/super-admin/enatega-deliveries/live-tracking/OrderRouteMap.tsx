'use client';

import { isGoogleMapsRefererNotAllowedError } from '@/lib/googleMaps';
import { useGoogleMapsLoader } from '@/lib/googleMapsLoader';
import { DirectionsRenderer, GoogleMap, OverlayView } from '@react-google-maps/api';
import { Bike, LocateFixed, MapPin, Navigation, Store } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useCallback, useEffect, useRef, useState } from 'react';

type LatLng = { lat: number; lng: number };
type KeyedRoute = { key: string; result: google.maps.DirectionsResult | null };

const MAP_HEIGHT = 320;
const containerStyle = { width: '100%', height: `${MAP_HEIGHT}px` };
const FIT_PADDING = 56;
// Re-request the rider leg only after the rider has moved this far, to avoid
// hitting the Directions API on every socket tick.
const RIDER_ROUTE_REFRESH_METERS = 150;

const riderToDropoffStatuses = new Set(['picked_up', 'out_for_delivery', 'arrived']);

const normalizeOrderStatus = (status?: string | null) =>
  String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const distanceMeters = (a: LatLng, b: LatLng) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export function MapLoadingState({ label = 'Loading map...' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted/30 text-sm text-muted-foreground"
      style={{ height: `${MAP_HEIGHT}px` }}
    >
      <Spinner className="size-6 text-primary" />
      {label}
    </div>
  );
}

const requestRoute = (origin: LatLng, destination: LatLng) =>
  new Promise<google.maps.DirectionsResult | null>((resolve) => {
    new google.maps.DirectionsService().route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => resolve(status === 'OK' && result ? result : null),
    );
  });

interface OrderRouteMapProps {
  pickup: LatLng | null;
  dropoff: LatLng | null;
  rider: LatLng | null;
  riderName: string;
  orderStatus?: string | null;
}

export function OrderRouteMap({
  pickup,
  dropoff,
  rider,
  riderName,
  orderStatus,
}: OrderRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [orderRouteState, setOrderRouteState] = useState<KeyedRoute | null>(null);
  const [riderRouteState, setRiderRouteState] = useState<KeyedRoute | null>(null);
  const riderRouteOriginRef = useRef<{ key: string; origin: LatLng } | null>(null);
  const riderRouteRequestIdRef = useRef(0);

  const isHeadingToDropoff = riderToDropoffStatuses.has(normalizeOrderStatus(orderStatus));
  const riderTarget = isHeadingToDropoff ? dropoff : pickup;

  const pickupKey = pickup ? `${pickup.lat},${pickup.lng}` : '';
  const dropoffKey = dropoff ? `${dropoff.lat},${dropoff.lng}` : '';
  const riderTargetKey = riderTarget ? `${riderTarget.lat},${riderTarget.lng}` : '';
  const orderRouteKey = `${pickupKey}|${dropoffKey}`;

  // Results are keyed by their request so a stale route never renders for a new order.
  const orderRoute =
    orderRouteState?.key === orderRouteKey ? orderRouteState.result : null;
  const riderRoute =
    riderRouteState?.key === riderTargetKey ? riderRouteState.result : null;

  // Pickup -> dropoff route; only changes when the order's endpoints change.
  useEffect(() => {
    if (!isLoaded || !pickup || !dropoff) return;
    let cancelled = false;
    requestRoute(pickup, dropoff).then((result) => {
      if (!cancelled) setOrderRouteState({ key: orderRouteKey, result });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, orderRouteKey]);

  // Rider -> current target (pickup before pickup, dropoff after).
  useEffect(() => {
    if (!isLoaded || !rider || !riderTarget) return;
    const last = riderRouteOriginRef.current;
    if (
      last?.key === riderTargetKey &&
      distanceMeters(last.origin, rider) < RIDER_ROUTE_REFRESH_METERS
    ) {
      return;
    }
    riderRouteOriginRef.current = { key: riderTargetKey, origin: rider };
    // Not cancelled on cleanup: rider ticks re-run this effect but are throttled
    // above, so only a newer request may supersede this one.
    const requestId = ++riderRouteRequestIdRef.current;
    requestRoute(rider, riderTarget).then((result) => {
      if (requestId === riderRouteRequestIdRef.current) {
        setRiderRouteState({ key: riderTargetKey, result });
      }
    });
  }, [isLoaded, rider, riderTarget, riderTargetKey]);

  const fitToRoute = useCallback(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    [pickup, dropoff, rider].forEach((point) => point && bounds.extend(point));
    [orderRoute, riderRoute].forEach((route) => {
      const routeBounds = route?.routes[0]?.bounds;
      if (routeBounds) bounds.union(routeBounds);
    });
    if (bounds.isEmpty()) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (ne.equals(sw)) {
      map.setCenter(ne);
      map.setZoom(15);
      return;
    }
    map.fitBounds(bounds, FIT_PADDING);
  }, [map, pickup, dropoff, rider, orderRoute, riderRoute]);

  // Re-fit whenever the routes resolve so the whole route stays in view.
  useEffect(() => {
    fitToRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, orderRoute, riderRoute, pickupKey, dropoffKey]);

  // Keep the live rider visible without fighting the user's zoom on every tick.
  useEffect(() => {
    if (!map || !rider) return;
    const visible = map.getBounds();
    if (visible && !visible.contains(rider)) fitToRoute();
  }, [map, rider, fitToRoute]);

  const riderLeg = riderRoute?.routes[0]?.legs[0];
  const orderLeg = orderRoute?.routes[0]?.legs[0];
  const center = rider ?? pickup ?? dropoff ?? { lat: 33.6844, lng: 73.0479 };
  const hasAnyPoint = Boolean(pickup || dropoff || rider);
  const isRoutePending = Boolean(pickup && dropoff) && orderRouteState?.key !== orderRouteKey;
  const showMapOverlay = !tilesLoaded || isRoutePending;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const renderFallback = (message: string) => (
    <div
      className="flex items-center justify-center rounded-lg bg-muted/30 px-4 text-center text-sm text-muted-foreground"
      style={{ height: `${MAP_HEIGHT}px` }}
    >
      {message}
    </div>
  );

  let content: React.ReactNode;
  if (!googleMapsApiKey) {
    content = renderFallback('Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to load live tracking.');
  } else if (loadError) {
    content = renderFallback(
      isGoogleMapsRefererNotAllowedError(loadError)
        ? 'Map not available. API key domain restriction.'
        : 'Failed to load map. Please check your Google Maps API key.',
    );
  } else if (!isLoaded) {
    content = <MapLoadingState />;
  } else if (!hasAnyPoint) {
    content = renderFallback('No location data available for this order.');
  } else {
    content = (
      <div className="relative overflow-hidden rounded-lg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={setMap}
          onUnmount={() => {
            setMap(null);
            setTilesLoaded(false);
          }}
          onTilesLoaded={() => setTilesLoaded(true)}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {orderRoute && (
            <DirectionsRenderer
              directions={orderRoute}
              options={{
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                  strokeColor: '#10b981',
                  strokeWeight: 5,
                  strokeOpacity: 0.7,
                },
              }}
            />
          )}
          {riderRoute && (
            <DirectionsRenderer
              directions={riderRoute}
              options={{
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                  strokeColor: '#3b82f6',
                  strokeWeight: 5,
                  strokeOpacity: 0.85,
                },
              }}
            />
          )}

          {pickup && (
            <OverlayView position={pickup} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <div className="rounded-full border-2 border-white bg-emerald-500 p-1.5 shadow-lg">
                  <Store className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="-mt-1 h-2 w-2 rotate-45 bg-emerald-500" />
              </div>
            </OverlayView>
          )}

          {dropoff && (
            <OverlayView position={dropoff} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <div className="rounded-full border-2 border-white bg-red-500 p-1.5 shadow-lg">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="-mt-1 h-2 w-2 rotate-45 bg-red-500" />
              </div>
            </OverlayView>
          )}

          {rider && (
            <OverlayView position={rider} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
                  <div className="relative rounded-full border-2 border-white bg-blue-500 p-1.5 shadow-lg">
                    <Bike className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <span className="mt-1 whitespace-nowrap rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
                  {riderName}
                </span>
              </div>
            </OverlayView>
          )}
        </GoogleMap>

        <button
          type="button"
          onClick={fitToRoute}
          title="Fit route"
          className="absolute left-2 top-2 rounded-md border border-sidebar-border bg-white p-1.5 text-foreground shadow-sm hover:bg-muted"
        >
          <LocateFixed className="h-4 w-4" />
        </button>

        {showMapOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-sm text-muted-foreground backdrop-blur-[1px]">
            <Spinner className="size-6 text-primary" />
            {tilesLoaded ? 'Loading route...' : 'Loading map...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {content}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Pickup
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Dropoff
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Rider (live)
          </span>
        </div>
        {orderLeg?.distance?.text && (
          <span className="text-muted-foreground">
            Route:{' '}
            <span className="font-medium text-foreground">{orderLeg.distance.text}</span>
          </span>
        )}
      </div>

      {riderLeg?.distance?.text && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-900">
          <Navigation className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {isHeadingToDropoff ? 'Rider → Dropoff' : 'Rider → Pickup'}
          </span>
          <span>{riderLeg.distance.text}</span>
          {riderLeg.duration?.text && <span>· ETA {riderLeg.duration.text}</span>}
        </div>
      )}
    </div>
  );
}
