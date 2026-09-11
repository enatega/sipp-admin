'use client';

import { isGoogleMapsRefererNotAllowedError } from '@/lib/googleMaps';
import { useGoogleMapsLoader } from '@/lib/googleMapsLoader';
import { GoogleMap, OverlayView } from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiderMapMarker } from './RiderMapMarker';
import type { RiderTrackingItem } from './types';

const MAP_HEIGHT = 640;
const containerStyle = { width: '100%', height: `${MAP_HEIGHT}px` };

interface LiveTrackingMapProps {
  items: RiderTrackingItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function LiveTrackingMap({
  items,
  selectedId,
  onSelect,
}: LiveTrackingMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useGoogleMapsLoader();

  const mappableItems = useMemo(
    () =>
      items.filter(
        (
          item,
        ): item is RiderTrackingItem & { coords: { lat: number; lng: number } } =>
          item.coords !== null,
      ),
    [items],
  );

  const selectedItem = useMemo(
    () =>
      mappableItems.find((item) => item.id === selectedId) ??
      mappableItems[0] ??
      null,
    [mappableItems, selectedId],
  );

  useEffect(() => {
    if (!map || !selectedItem) {
      return;
    }

    map.panTo(selectedItem.coords);
    map.setZoom(13);
  }, [map, selectedItem]);

  const onLoad = useCallback((instance: google.maps.Map) => {
    setMap(instance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const fallbackStyle = { height: `${MAP_HEIGHT}px` };
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!googleMapsApiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-b-[12px] bg-muted/30 text-sm text-muted-foreground"
        style={fallbackStyle}
      >
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to load live tracking.
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-b-[12px] bg-muted/30 text-sm text-muted-foreground"
        style={fallbackStyle}
      >
        {isGoogleMapsRefererNotAllowedError(loadError)
          ? 'Map not available. API key domain restriction.'
          : 'Failed to load map. Please check your Google Maps API key.'}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex animate-pulse items-center justify-center rounded-b-[12px] bg-muted/30 text-sm text-muted-foreground"
        style={fallbackStyle}
      >
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedItem?.coords ?? { lat: 24.8607, lng: 67.0011 }}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ disableDefaultUI: false, zoomControl: true }}
    >
      {mappableItems.map((item) => (
        <OverlayView
          key={item.id}
          position={item.coords}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <RiderMapMarker
            item={item}
            isSelected={selectedItem?.id === item.id}
            onClick={() => onSelect(item.id)}
          />
        </OverlayView>
      ))}
    </GoogleMap>
  );
}
