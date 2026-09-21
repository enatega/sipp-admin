'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { LocateIcon, Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isGoogleMapsRefererNotAllowedError } from '@/lib/googleMaps';
import { useGoogleMapsLoader } from '@/lib/googleMapsLoader';
import { normalizePolygonPath, type LatLngPoint } from '@/lib/polygon-path';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import DrawingTools from './DrawingTools';

const containerStyle = {
  width: '100%',
  height: '400px',
  position: 'relative' as const,
};

// Costa Rica
const DEFAULT_CENTER = {
  lat: 9.7489,
  lng: -83.7534,
};

const ZONE_FILL_COLOR = '#F97316';
const ZONE_STROKE_COLOR = '#9A3412';
const ZONE_FILL_OPACITY = 0.38;
const ZONE_STROKE_WEIGHT = 3;
const METERS_PER_KM = 1000;
const DEFAULT_CIRCLE_RADIUS = 50 * METERS_PER_KM;
const MIN_SEARCH_RADIUS = 200;

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversineDistanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
};

const getPathCentroid = (path: { lat: number; lng: number }[]) => {
  const lats = path.map((point) => point.lat);
  const lngs = path.map((point) => point.lng);

  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};

const getPathAverageRadiusMeters = (path: { lat: number; lng: number }[]) => {
  if (path.length === 0) {
    return 0;
  }

  const center = getPathCentroid(path);
  const total = path.reduce(
    (sum, point) => sum + haversineDistanceMeters(center, point),
    0,
  );

  return total / path.length;
};

const SHAPE_OPTIONS = {
  fillColor: ZONE_FILL_COLOR,
  fillOpacity: ZONE_FILL_OPACITY,
  strokeColor: ZONE_STROKE_COLOR,
  strokeOpacity: 0.95,
  strokeWeight: ZONE_STROKE_WEIGHT,
  clickable: false,
  editable: true,
  draggable: true,
  zIndex: 2,
};

export interface ZoneData {
  type: 'circle' | 'polygon' | 'polyline' | 'marker' | null;
  center?: { lat: number; lng: number };
  radius?: number;
  path?: { lat: number; lng: number }[];
}

export interface AddressZoneShape {
  type: 'Polygon' | 'Circle' | 'Point' | 'LineString';
  coordinates?: number[][] | number[][][] | number[];
  center?: { lat: number; lng: number };
  radius?: number;
}

export interface ExactStoreLocation {
  latitude: number;
  longitude: number;
}

interface InteractiveMapProps {
  value: ZoneData | null;
  onChange: (value: ZoneData | null) => void;
  hideZoomControls?: boolean;
  searchSelectsMarker?: boolean;
  exactStoreLocation?: ExactStoreLocation | null;
  onExactStoreLocationChange?: (value: ExactStoreLocation | null) => void;
  exactStoreLocationLabel?: string;
  exactStoreLocationDescription?: string;
  exactStoreLocationLatitudeLabel?: string;
  exactStoreLocationLongitudeLabel?: string;
}

type GoogleMapOverlay =
  | google.maps.Circle
  | google.maps.Polygon
  | google.maps.Polyline
  | google.maps.marker.AdvancedMarkerElement;
type DrawingMode = NonNullable<ZoneData['type']>;
type ToolDrawingMode = 'CIRCLE' | 'MARKER' | 'POLYGON' | 'POLYLINE';
type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;
type SearchPrediction = {
  id: string;
  label: string;
  placeId: string | null;
  nextPrediction?: google.maps.places.PlacePrediction;
  legacyPrediction?: google.maps.places.AutocompletePrediction;
};

const DRAWING_MODE_BY_TOOL: Record<ToolDrawingMode, DrawingMode> = {
  CIRCLE: 'circle',
  MARKER: 'marker',
  POLYGON: 'polygon',
  POLYLINE: 'polyline',
};

const buildStoreMarkerContent = () => {
  const img = document.createElement('img');
  img.src = '/markers/store-marker.svg';
  img.alt = '';
  img.width = 56;
  img.height = 74;
  img.draggable = false;
  img.style.width = '56px';
  img.style.height = '74px';
  img.style.display = 'block';

  return img;
};

const buildDotMarkerContent = () => {
  const dot = document.createElement('div');
  dot.style.width = '12px';
  dot.style.height = '12px';
  dot.style.borderRadius = '9999px';
  dot.style.backgroundColor = '#2563eb';
  dot.style.border = '2px solid #ffffff';
  dot.style.boxSizing = 'border-box';
  dot.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.25)';

  return dot;
};

const toLatLngLiteral = (
  position:
    | google.maps.LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | null
    | undefined,
) => {
  if (!position) {
    return null;
  }

  if (position instanceof google.maps.LatLng) {
    return position.toJSON();
  }

  return {
    lat: Number(position.lat),
    lng: Number(position.lng),
  };
};

const getZoneCenter = (zone: ZoneData | null): ExactStoreLocation | null => {
  if (!zone) {
    return null;
  }

  if ((zone.type === 'circle' || zone.type === 'marker') && zone.center) {
    return {
      latitude: zone.center.lat,
      longitude: zone.center.lng,
    };
  }

  if (
    (zone.type === 'polygon' || zone.type === 'polyline') &&
    zone.path &&
    zone.path.length > 0
  ) {
    const latitudes = zone.path.map((point) => point.lat);
    const longitudes = zone.path.map((point) => point.lng);

    return {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    };
  }

  return null;
};

export default function InteractiveMap({
  value,
  onChange,
  hideZoomControls = false,
  searchSelectsMarker = false,
  exactStoreLocation = null,
  onExactStoreLocationChange,
  exactStoreLocationLabel,
  exactStoreLocationDescription,
  exactStoreLocationLatitudeLabel,
  exactStoreLocationLongitudeLabel,
}: InteractiveMapProps) {
  const t = useTranslations('zones.map');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onChangeRef = useRef(onChange);
  const [drawingMode, setDrawingMode] = useState<DrawingMode | null>(null);
  const drawingModeRef = useRef<DrawingMode | null>(null);
  const drawnOverlayRef = useRef<GoogleMapOverlay | null>(null);
  const polylineFillRef = useRef<google.maps.Polygon | null>(null);
  const draftPolylineRef = useRef<google.maps.Polyline | null>(null);
  const draftPolylinePathRef = useRef<google.maps.LatLng[]>([]);
  const centerMarkerRef = useRef<AdvancedMarker | null>(null);
  const initialPath = useRef<google.maps.LatLng[] | null>(null);
  const initialMarkerPos = useRef<google.maps.LatLngLiteral | null>(null);
  const firstPointMarker = useRef<AdvancedMarker | null>(null);
  const exactStoreMarkerRef = useRef<AdvancedMarker | null>(null);
  const overlayListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const searchRequestIdRef = useRef(0);
  const autocompleteSessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const markerLibraryRef = useRef<google.maps.MarkerLibrary | null>(null);
  const legacyAutocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<SearchPrediction[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const zoneCenter = getZoneCenter(value);
  const hasZoneValue = Boolean(value);
  const exactStoreLocationLatitude = exactStoreLocation?.latitude ?? null;
  const exactStoreLocationLongitude = exactStoreLocation?.longitude ?? null;
  const zoneValueType = value?.type ?? null;
  const zoneValueCenterLat = value?.center?.lat ?? null;
  const zoneValueCenterLng = value?.center?.lng ?? null;
  const zoneValueRadius = value?.radius ?? null;
  const zoneValuePathKey =
    value?.path?.map((point) => `${point.lat}:${point.lng}`).join('|') ?? '';
  const stableExactStoreLocation = useMemo(
    () =>
      exactStoreLocationLatitude !== null &&
      exactStoreLocationLongitude !== null
        ? {
            latitude: exactStoreLocationLatitude,
            longitude: exactStoreLocationLongitude,
          }
        : null,
    [exactStoreLocationLatitude, exactStoreLocationLongitude],
  );
  const stableZoneCenter = useMemo(
    () =>
      zoneValueCenterLat !== null && zoneValueCenterLng !== null
        ? { lat: zoneValueCenterLat, lng: zoneValueCenterLng }
        : null,
    [zoneValueCenterLat, zoneValueCenterLng],
  );
  const stableZonePath = value?.path ?? null;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const getMarkerLibrary = useCallback(async () => {
    if (markerLibraryRef.current) {
      return markerLibraryRef.current;
    }

    const markerLibrary = (await google.maps.importLibrary(
      'marker',
    )) as google.maps.MarkerLibrary;
    markerLibraryRef.current = markerLibrary;
    return markerLibrary;
  }, []);

  const clearOverlayListeners = useCallback(() => {
    overlayListenersRef.current.forEach((listener) => listener.remove());
    overlayListenersRef.current = [];
  }, []);

  const clearPolylineFill = useCallback(() => {
    if (polylineFillRef.current) {
      polylineFillRef.current.setMap(null);
      polylineFillRef.current = null;
    }
  }, []);

  const clearDraftPolyline = useCallback(() => {
    if (draftPolylineRef.current) {
      draftPolylineRef.current.setMap(null);
      draftPolylineRef.current = null;
    }

    draftPolylinePathRef.current = [];
  }, []);

  const getLegacyAutocompleteService = useCallback(() => {
    if (legacyAutocompleteServiceRef.current) {
      return legacyAutocompleteServiceRef.current;
    }

    legacyAutocompleteServiceRef.current =
      new google.maps.places.AutocompleteService();

    return legacyAutocompleteServiceRef.current;
  }, []);

  const getGeocoder = useCallback(() => {
    if (geocoderRef.current) {
      return geocoderRef.current;
    }

    geocoderRef.current = new google.maps.Geocoder();

    return geocoderRef.current;
  }, []);

  const getClosedPolylinePath = useCallback(
    (path: { lat: number; lng: number }[]) => {
      if (path.length < 3) {
        return null;
      }

      const closedPath = [...path];
      const firstPoint = closedPath[0];
      const lastPoint = closedPath[closedPath.length - 1];

      if (
        firstPoint.lat !== lastPoint.lat ||
        firstPoint.lng !== lastPoint.lng
      ) {
        closedPath.push(firstPoint);
      }

      return closedPath;
    },
    [],
  );

  const syncPolylineFill = useCallback(
    (
      path: { lat: number; lng: number }[],
      mapInstance: google.maps.Map | null,
    ) => {
      clearPolylineFill();

      const closedPath = getClosedPolylinePath(path);
      if (!closedPath || !mapInstance) {
        return;
      }

      polylineFillRef.current = new google.maps.Polygon({
        paths: closedPath,
        fillColor: ZONE_FILL_COLOR,
        fillOpacity: ZONE_FILL_OPACITY,
        strokeOpacity: 0,
        strokeWeight: 0,
        clickable: false,
        editable: false,
        draggable: false,
        zIndex: 1,
        map: mapInstance,
      });
    },
    [clearPolylineFill, getClosedPolylinePath],
  );

  const syncPolylineOverlay = useCallback(
    (polyline: google.maps.Polyline, shouldEmitChange = true) => {
      const path = polyline
        .getPath()
        .getArray()
        .map((point) => point.toJSON());
      syncPolylineFill(path, map);

      if (shouldEmitChange) {
        onChangeRef.current({ type: 'polyline', path });
      }
    },
    [map, syncPolylineFill],
  );

  const syncPolygonOverlay = useCallback(
    (polygon: google.maps.Polygon, shouldEmitChange = true) => {
      const path = normalizePolygonPath(
        polygon
          .getPath()
          .getArray()
          .map((point) => point.toJSON()),
      );

      if (shouldEmitChange) {
        onChangeRef.current({ type: 'polygon', path });
      }
    },
    [],
  );

  const attachPolylineListeners = useCallback(
    (polyline: google.maps.Polyline) => {
      clearOverlayListeners();

      const sync = () => syncPolylineOverlay(polyline);
      const path = polyline.getPath();

      overlayListenersRef.current = [
        path.addListener('set_at', sync),
        path.addListener('insert_at', sync),
        path.addListener('remove_at', sync),
        polyline.addListener('dragend', sync),
      ];
    },
    [clearOverlayListeners, syncPolylineOverlay],
  );

  const attachMarkerListeners = useCallback(
    (marker: AdvancedMarker) => {
      clearOverlayListeners();

      const sync = () => {
        const position = toLatLngLiteral(marker.position);
        if (!position) return;

        onChangeRef.current({ type: 'marker', center: position });
      };

      overlayListenersRef.current = [marker.addListener('dragend', sync)];
    },
    [clearOverlayListeners],
  );

  const attachCircleListeners = useCallback(
    (circle: google.maps.Circle) => {
      clearOverlayListeners();

      const sync = () => {
        const center = circle.getCenter();
        if (!center) return;

        onChangeRef.current({
          type: 'circle',
          center: center.toJSON(),
          radius: circle.getRadius(),
        });
      };

      overlayListenersRef.current = [
        circle.addListener('center_changed', sync),
        circle.addListener('radius_changed', sync),
        circle.addListener('dragend', sync),
      ];
    },
    [clearOverlayListeners],
  );

  const attachPolygonListeners = useCallback(
    (polygon: google.maps.Polygon) => {
      clearOverlayListeners();

      const sync = () => syncPolygonOverlay(polygon);

      overlayListenersRef.current = [
        // Persist only after a pointer gesture finishes. Updating React state
        // on every `set_at` tears down the overlay mid-drag and cancels both
        // native vertex editing and whole-polygon dragging.
        polygon.addListener('mouseup', sync),
        polygon.addListener('dragend', sync),
      ];
    },
    [clearOverlayListeners, syncPolygonOverlay],
  );

  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);

  const clearDrawing = useCallback(
    (shouldEmitChange = true) => {
      clearOverlayListeners();
      if (drawnOverlayRef.current) {
        if (
          drawnOverlayRef.current instanceof google.maps.Circle ||
          drawnOverlayRef.current instanceof google.maps.Polygon ||
          drawnOverlayRef.current instanceof google.maps.Polyline
        ) {
          drawnOverlayRef.current.setMap(null);
        } else {
          drawnOverlayRef.current.map = null;
        }
        drawnOverlayRef.current = null;
      }
      clearPolylineFill();
      clearDraftPolyline();
      if (centerMarkerRef.current) {
        centerMarkerRef.current.map = null;
        centerMarkerRef.current = null;
      }
      if (firstPointMarker.current) {
        firstPointMarker.current.map = null;
        firstPointMarker.current = null;
      }
      if (shouldEmitChange) {
        onChangeRef.current(null);
      }
    },
    [
      clearDraftPolyline,
      clearOverlayListeners,
      clearPolylineFill,
    ],
  );

  const completeOverlay = useCallback(
    async (
      type: DrawingMode,
      overlay: GoogleMapOverlay,
      mapInstance: google.maps.Map,
    ) => {
      clearDrawing(false);

      let zoneData: ZoneData | null = null;
      let centroid: google.maps.LatLng | null = null;

      drawnOverlayRef.current = overlay;

      if (type === 'circle') {
        const circle = overlay as google.maps.Circle;
        centroid = circle.getCenter() ?? null;
        zoneData = {
          type: 'circle',
          center: centroid?.toJSON(),
          radius: circle.getRadius(),
        };
        attachCircleListeners(circle);
        const bounds = circle.getBounds();
        if (bounds) {
          mapInstance.fitBounds(bounds);
        }
      } else if (type === 'polygon') {
        const polygon = overlay as google.maps.Polygon;
        const path = normalizePolygonPath(
          polygon
            .getPath()
            .getArray()
            .map((point: google.maps.LatLng) => point.toJSON()),
        );
        zoneData = { type: 'polygon', path };
        attachPolygonListeners(polygon);

        const bounds = new google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        centroid = bounds.getCenter();
        mapInstance.fitBounds(bounds);
      } else if (type === 'polyline') {
        const polyline = overlay as google.maps.Polyline;
        const path = polyline
          .getPath()
          .getArray()
          .map((point: google.maps.LatLng) => point.toJSON());
        const bounds = new google.maps.LatLngBounds();
        polyline.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));
        centroid = bounds.getCenter();
        zoneData = { type: 'polyline', path };
        syncPolylineFill(path, mapInstance);
        attachPolylineListeners(polyline);
        mapInstance.fitBounds(bounds);
      } else if (type === 'marker') {
        const marker = overlay as AdvancedMarker;
        const markerPosition = toLatLngLiteral(marker.position);
        centroid = markerPosition
          ? new google.maps.LatLng(markerPosition.lat, markerPosition.lng)
          : null;
        zoneData = { type: 'marker', center: markerPosition ?? undefined };
        attachMarkerListeners(marker);
        if (centroid) {
          mapInstance.panTo(centroid);
          mapInstance.setZoom(15);
        }
      }

      onChangeRef.current(zoneData);
      setDrawingMode(null);

      if (!centroid || type === 'polygon') {
        return;
      }

      const { AdvancedMarkerElement } = await getMarkerLibrary();
      const newMarker = new AdvancedMarkerElement({
        position: centroid,
        map: mapInstance,
        gmpDraggable: true,
        content:
          type === 'marker'
            ? buildStoreMarkerContent()
            : buildDotMarkerContent(),
      });
      centerMarkerRef.current = newMarker;

      newMarker.addListener('dragstart', () => {
        const pos = toLatLngLiteral(newMarker.position);
        if (pos) {
          initialMarkerPos.current = pos;
          if (type === 'polyline' && drawnOverlayRef.current) {
            initialPath.current = (
              drawnOverlayRef.current as google.maps.Polyline
            )
              .getPath()
              .getArray();
          }
        }
      });

      newMarker.addListener('dragend', () => {
        const endPos = toLatLngLiteral(newMarker.position);
        const startPos = initialMarkerPos.current;
        if (endPos && startPos && drawnOverlayRef.current) {
          const latOffset = endPos.lat - startPos.lat;
          const lngOffset = endPos.lng - startPos.lng;

          if (type === 'circle') {
            (drawnOverlayRef.current as google.maps.Circle).setCenter(endPos);
          } else if (type === 'polyline' && initialPath.current) {
            const newPath = initialPath.current.map(
              (p) =>
                new google.maps.LatLng(
                  p.lat() + latOffset,
                  p.lng() + lngOffset,
                ),
            );
            const polyline = drawnOverlayRef.current as google.maps.Polyline;
            polyline.setPath(newPath);
            attachPolylineListeners(polyline);
            syncPolylineOverlay(polyline);
          } else if (type === 'marker') {
            (drawnOverlayRef.current as AdvancedMarker).position = endPos;
          }
        }
      });
    },
    [
      attachCircleListeners,
      attachMarkerListeners,
      attachPolygonListeners,
      attachPolylineListeners,
      clearDrawing,
      getMarkerLibrary,
      syncPolylineFill,
      syncPolylineOverlay,
    ],
  );

  const createRegularPolygon = useCallback(
    async (
      clickCenter: google.maps.LatLng,
      mapInstance: google.maps.Map,
      radius: number = DEFAULT_CIRCLE_RADIUS,
    ) => {
      const numberOfSides = 8;
      const path: google.maps.LatLng[] = [];

      for (let i = 0; i < numberOfSides; i++) {
        const angle = (i * 2 * Math.PI) / numberOfSides;
        const lat = clickCenter.lat() + (radius / 111320) * Math.cos(angle);
        const lng =
          clickCenter.lng() +
          (radius / (111320 * Math.cos(clickCenter.lat()))) * Math.sin(angle);
        path.push(new google.maps.LatLng(lat, lng));
      }

      const polygon = new google.maps.Polygon({
        paths: path,
        ...SHAPE_OPTIONS,
        editable: true,
        clickable: true,
        map: mapInstance,
      });

      await completeOverlay('polygon', polygon, mapInstance);
    },
    [completeOverlay],
  );

  const createCircleAt = useCallback(
    async (center: google.maps.LatLng, mapInstance: google.maps.Map) => {
      const circle = new google.maps.Circle({
        ...SHAPE_OPTIONS,
        center,
        radius: DEFAULT_CIRCLE_RADIUS,
        map: mapInstance,
      });

      await completeOverlay('circle', circle, mapInstance);
    },
    [completeOverlay],
  );

  const createMarkerAt = useCallback(
    async (position: google.maps.LatLng, mapInstance: google.maps.Map) => {
      const { AdvancedMarkerElement } = await getMarkerLibrary();
      const marker = new AdvancedMarkerElement({
        position,
        map: mapInstance,
        gmpDraggable: true,
        content: buildStoreMarkerContent(),
      });

      await completeOverlay('marker', marker, mapInstance);
    },
    [completeOverlay, getMarkerLibrary],
  );

  const handlePolylineDrawingClick = useCallback(
    async (position: google.maps.LatLng, mapInstance: google.maps.Map) => {
      if (!draftPolylineRef.current) {
        draftPolylinePathRef.current = [position];
        draftPolylineRef.current = new google.maps.Polyline({
          strokeColor: ZONE_STROKE_COLOR,
          strokeOpacity: 0.95,
          strokeWeight: ZONE_STROKE_WEIGHT,
          clickable: false,
          editable: false,
          draggable: false,
          zIndex: 2,
          path: [position, position],
          map: mapInstance,
        });

        if (firstPointMarker.current) {
          firstPointMarker.current.map = null;
        }

        const { AdvancedMarkerElement } = await getMarkerLibrary();
        firstPointMarker.current = new AdvancedMarkerElement({
          position,
          map: mapInstance,
          content: buildDotMarkerContent(),
        });
        return;
      }

      const firstPoint = draftPolylinePathRef.current[0];
      const polyline = new google.maps.Polyline({
        strokeColor: ZONE_STROKE_COLOR,
        strokeOpacity: 0.95,
        strokeWeight: ZONE_STROKE_WEIGHT,
        clickable: false,
        editable: true,
        draggable: true,
        zIndex: 2,
        path: [firstPoint, position],
        map: mapInstance,
      });

      await completeOverlay('polyline', polyline, mapInstance);
    },
    [completeOverlay, getMarkerLibrary],
  );

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      setDrawingMode(value?.type ? null : 'circle');
    },
    [value?.type],
  );

  // Render saved zone overlay from value (for edit mode)
  useEffect(() => {
    if (!map) return;

    clearOverlayListeners();
    clearPolylineFill();
    clearDraftPolyline();

    if (drawnOverlayRef.current) {
      if (
        drawnOverlayRef.current instanceof google.maps.Circle ||
        drawnOverlayRef.current instanceof google.maps.Polygon ||
        drawnOverlayRef.current instanceof google.maps.Polyline
      ) {
        drawnOverlayRef.current.setMap(null);
      } else {
        drawnOverlayRef.current.map = null;
      }
      drawnOverlayRef.current = null;
    }
    if (centerMarkerRef.current) {
      centerMarkerRef.current.map = null;
      centerMarkerRef.current = null;
    }

    if (!hasZoneValue || !zoneValueType) return;

    let newOverlay: GoogleMapOverlay | null = null;
    let isCancelled = false;

    const renderOverlay = async () => {
      const exactStoreLatLng = stableExactStoreLocation
        ? new google.maps.LatLng(
            stableExactStoreLocation.latitude,
            stableExactStoreLocation.longitude,
          )
        : null;

      if (
        zoneValueType === 'circle' &&
        stableZoneCenter &&
        zoneValueRadius !== null
      ) {
        newOverlay = new google.maps.Circle({
          ...SHAPE_OPTIONS,
          center: stableZoneCenter,
          radius: zoneValueRadius,
          map,
        });
      } else if (zoneValueType === 'polygon' && Array.isArray(stableZonePath)) {
        newOverlay = new google.maps.Polygon({
          ...SHAPE_OPTIONS,
          editable: true,
          clickable: true,
          paths: normalizePolygonPath(stableZonePath),
          map,
        });
      } else if (
        zoneValueType === 'polyline' &&
        Array.isArray(stableZonePath)
      ) {
        newOverlay = new google.maps.Polyline({
          strokeColor: ZONE_STROKE_COLOR,
          strokeOpacity: 0.95,
          strokeWeight: ZONE_STROKE_WEIGHT,
          clickable: false,
          editable: true,
          draggable: true,
          zIndex: 2,
          path: stableZonePath,
          map,
        });
        syncPolylineFill(stableZonePath, map);
      } else if (zoneValueType === 'marker' && stableZoneCenter) {
        const { AdvancedMarkerElement } = await getMarkerLibrary();
        newOverlay = new AdvancedMarkerElement({
          position: stableZoneCenter,
          map,
          gmpDraggable: true,
          content: buildStoreMarkerContent(),
        });
      }

      if (isCancelled || !newOverlay) {
        if (
          newOverlay instanceof google.maps.Circle ||
          newOverlay instanceof google.maps.Polygon ||
          newOverlay instanceof google.maps.Polyline
        ) {
          newOverlay.setMap(null);
        } else if (newOverlay) {
          newOverlay.map = null;
        }
        return;
      }

      drawnOverlayRef.current = newOverlay;

      if (
        zoneValueType === 'circle' &&
        newOverlay instanceof google.maps.Circle
      ) {
        attachCircleListeners(newOverlay);
      }

      if (
        zoneValueType === 'marker' &&
        newOverlay instanceof google.maps.marker.AdvancedMarkerElement
      ) {
        attachMarkerListeners(newOverlay);
      }

      if (
        zoneValueType === 'polygon' &&
        newOverlay instanceof google.maps.Polygon
      ) {
        attachPolygonListeners(newOverlay);
      }

      if (
        zoneValueType === 'polyline' &&
        newOverlay instanceof google.maps.Polyline
      ) {
        attachPolylineListeners(newOverlay);
      }

      if (zoneValueType === 'circle' && stableZoneCenter) {
        const bounds =
          (newOverlay instanceof google.maps.Circle &&
            newOverlay.getBounds()) ||
          null;

        if (bounds) {
          if (exactStoreLatLng) {
            bounds.extend(exactStoreLatLng);
          }
          map.fitBounds(bounds);
        } else {
          map.panTo(stableZoneCenter);
          map.setZoom(14);
        }
      } else if (
        (zoneValueType === 'polygon' || zoneValueType === 'polyline') &&
        stableZonePath &&
        stableZonePath.length > 0
      ) {
        const bounds = new google.maps.LatLngBounds();
        stableZonePath.forEach((point) => bounds.extend(point));
        if (exactStoreLatLng) {
          bounds.extend(exactStoreLatLng);
        }
        map.fitBounds(bounds);
      } else if (zoneValueType === 'marker' && stableZoneCenter) {
        map.panTo(stableZoneCenter);
        map.setZoom(14);
      }
    };

    void renderOverlay();

    return () => {
      isCancelled = true;
      clearOverlayListeners();
      clearPolylineFill();
      clearDraftPolyline();
      if (newOverlay) {
        if (
          newOverlay instanceof google.maps.Circle ||
          newOverlay instanceof google.maps.Polygon ||
          newOverlay instanceof google.maps.Polyline
        ) {
          newOverlay.setMap(null);
        } else {
          newOverlay.map = null;
        }
      }
    };
  }, [
    attachPolygonListeners,
    attachPolylineListeners,
    attachCircleListeners,
    attachMarkerListeners,
    clearDraftPolyline,
    clearOverlayListeners,
    clearPolylineFill,
    getMarkerLibrary,
    map,
    syncPolylineFill,
    hasZoneValue,
    stableExactStoreLocation,
    stableZoneCenter,
    stableZonePath,
    exactStoreLocationLatitude,
    exactStoreLocationLongitude,
    zoneValueCenterLat,
    zoneValueCenterLng,
    zoneValuePathKey,
    zoneValueRadius,
    zoneValueType,
  ]);

  useEffect(() => {
    if (
      !onExactStoreLocationChange ||
      zoneValueType !== 'marker' ||
      zoneValueCenterLat === null ||
      zoneValueCenterLng === null
    ) {
      return;
    }

    const nextExactStoreLocation = {
      latitude: zoneValueCenterLat,
      longitude: zoneValueCenterLng,
    };

    if (
      exactStoreLocationLatitude === nextExactStoreLocation.latitude &&
      exactStoreLocationLongitude === nextExactStoreLocation.longitude
    ) {
      return;
    }

    onExactStoreLocationChange(nextExactStoreLocation);
  }, [
    exactStoreLocationLatitude,
    exactStoreLocationLongitude,
    onExactStoreLocationChange,
    zoneValueCenterLat,
    zoneValueCenterLng,
    zoneValueType,
  ]);

  useEffect(() => {
    let isCancelled = false;

    if (
      !map ||
      !onExactStoreLocationChange ||
      !stableExactStoreLocation ||
      zoneValueType === 'marker'
    ) {
      if (exactStoreMarkerRef.current) {
        exactStoreMarkerRef.current.map = null;
        exactStoreMarkerRef.current = null;
      }
      return;
    }

    const syncExactStoreMarker = async () => {
      const { AdvancedMarkerElement } = await getMarkerLibrary();

      if (isCancelled) {
        return;
      }

      if (exactStoreMarkerRef.current) {
        exactStoreMarkerRef.current.map = null;
        exactStoreMarkerRef.current = null;
      }

      const marker = new AdvancedMarkerElement({
        map,
        gmpDraggable: true,
        content: buildStoreMarkerContent(),
        title: exactStoreLocationLabel || 'Exact Store Location',
      });

      marker.map = map;
      marker.position = {
        lat: stableExactStoreLocation.latitude,
        lng: stableExactStoreLocation.longitude,
      };
      marker.gmpDraggable = true;

      if (!hasZoneValue) {
        map.panTo(marker.position);
        map.setZoom(16);
      }

      marker.addListener('dragend', () => {
        const position = toLatLngLiteral(marker.position);
        if (!position) return;

        onExactStoreLocationChange({
          latitude: position.lat,
          longitude: position.lng,
        });
      });

      exactStoreMarkerRef.current = marker;
    };

    void syncExactStoreMarker();

    return () => {
      isCancelled = true;
      if (exactStoreMarkerRef.current) {
        exactStoreMarkerRef.current.map = null;
        exactStoreMarkerRef.current = null;
      }
    };
  }, [
    exactStoreLocationLabel,
    exactStoreLocationLatitude,
    exactStoreLocationLongitude,
    getMarkerLibrary,
    map,
    hasZoneValue,
    onExactStoreLocationChange,
    stableExactStoreLocation,
    zoneValueType,
  ]);

  const fetchLegacyPredictions = useCallback(
    (query: string) =>
      new Promise<SearchPrediction[]>((resolve, reject) => {
        try {
          const autocompleteService = getLegacyAutocompleteService();

          autocompleteService.getPlacePredictions(
            {
              input: query,
              sessionToken: autocompleteSessionTokenRef.current ?? undefined,
            },
            (results, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK ||
                status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
              ) {
                resolve(
                  (results ?? []).map((prediction) => ({
                    id: prediction.place_id,
                    label: prediction.description,
                    placeId: prediction.place_id,
                    legacyPrediction: prediction,
                  })),
                );
                return;
              }

              reject(
                new Error(`Legacy autocomplete failed with status ${status}`),
              );
            },
          );
        } catch (error) {
          reject(error);
        }
      }),
    [getLegacyAutocompleteService],
  );

  const resolveLegacyPredictionLocation = useCallback(
    (placeId: string) =>
      new Promise<{
        location: google.maps.LatLng;
        viewport: google.maps.LatLngBounds | null;
      } | null>((resolve, reject) => {
        try {
          const geocoder = getGeocoder();

          geocoder.geocode({ placeId }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              const location = results?.[0]?.geometry?.location ?? null;
              if (!location) {
                resolve(null);
                return;
              }

              resolve({
                location,
                viewport: results?.[0]?.geometry?.viewport ?? null,
              });
              return;
            }

            if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
              resolve(null);
              return;
            }

            reject(new Error(`Geocoder failed with status ${status}`));
          });
        } catch (error) {
          reject(error);
        }
      }),
    [getGeocoder],
  );

  const applySelectedLocation = useCallback(
    async (
      location: google.maps.LatLng,
      viewport?: google.maps.LatLngBounds | null,
    ) => {
      if (!map) {
        return;
      }

      const coords = location.toJSON();
      map.panTo(location);

      if (onExactStoreLocationChange) {
        onExactStoreLocationChange({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        map.setZoom(15);
        return;
      }

      if (searchSelectsMarker) {
        map.setZoom(15);
        const hasNonMarkerZone =
          Boolean(value?.type) && value?.type !== 'marker';

        if (!hasNonMarkerZone) {
          clearDrawing(false);
          await createMarkerAt(location, map);
        }
        return;
      }

      // Pure zone-drawing flow: auto-fit a circle around the searched
      // place so, e.g., searching "Costa Rica" roughly encircles it.
      const hasNonCircleZone = Boolean(value?.type) && value?.type !== 'circle';
      if (hasNonCircleZone) {
        map.setZoom(15);
        return;
      }

      const searchRadius = viewport
        ? Math.max(
            haversineDistanceMeters(coords, viewport.getNorthEast().toJSON()),
            MIN_SEARCH_RADIUS,
          )
        : DEFAULT_CIRCLE_RADIUS;

      clearDrawing(false);
      const circle = new google.maps.Circle({
        ...SHAPE_OPTIONS,
        center: location,
        radius: searchRadius,
        map,
      });
      await completeOverlay('circle', circle, map);
    },
    [
      clearDrawing,
      completeOverlay,
      createMarkerAt,
      map,
      onExactStoreLocationChange,
      searchSelectsMarker,
      value?.type,
    ],
  );

  const focusExactStoreLocation = useCallback(
    (location: ExactStoreLocation) => {
      if (!map) {
        return;
      }

      map.panTo({
        lat: location.latitude,
        lng: location.longitude,
      });
      map.setZoom(16);
    },
    [map],
  );

  const handleUseZoneCenterForExactLocation = useCallback(() => {
    if (!zoneCenter || !onExactStoreLocationChange) {
      return;
    }

    onExactStoreLocationChange(zoneCenter);
    focusExactStoreLocation(zoneCenter);
  }, [focusExactStoreLocation, onExactStoreLocationChange, zoneCenter]);

  const handleRecenterToExactLocation = useCallback(() => {
    if (!zoneCenter || !onExactStoreLocationChange) {
      return;
    }

    onExactStoreLocationChange(zoneCenter);
    focusExactStoreLocation(zoneCenter);
  }, [focusExactStoreLocation, onExactStoreLocationChange, zoneCenter]);

  const handleSearchInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length <= 2) {
      searchRequestIdRef.current += 1;
      setPredictions([]);
      if (!query.trim()) {
        autocompleteSessionTokenRef.current = null;
      }
      return;
    }

    if (!autocompleteSessionTokenRef.current) {
      autocompleteSessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    }

    const requestId = ++searchRequestIdRef.current;

    try {
      const { suggestions } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          {
            input: query,
            sessionToken: autocompleteSessionTokenRef.current,
          },
        );

      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      const nextPredictions = suggestions
        .map((suggestion) => suggestion.placePrediction)
        .filter(
          (prediction): prediction is google.maps.places.PlacePrediction =>
            prediction != null,
        )
        .map((prediction) => ({
          id: prediction.placeId,
          label: prediction.text.toString(),
          placeId: prediction.placeId,
          nextPrediction: prediction,
        }));

      setPredictions(nextPredictions);
      setHighlightedIndex(-1);
    } catch (newAutocompleteError) {
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      console.warn(
        'InteractiveMap autocomplete via Places API (New) failed, falling back to legacy autocomplete.',
        newAutocompleteError,
      );

      try {
        const legacyPredictions = await fetchLegacyPredictions(query);

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        setPredictions(legacyPredictions);
        setHighlightedIndex(-1);
      } catch (legacyAutocompleteError) {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        console.error(
          'InteractiveMap autocomplete failed for both Places API (New) and the legacy fallback. Ensure Maps JavaScript API and Places API are enabled for this key.',
          {
            newAutocompleteError,
            legacyAutocompleteError,
          },
        );
        setPredictions([]);
      }
    }
  };

  const handlePredictionClick = async (prediction: SearchPrediction) => {
    setSearchQuery(prediction.label);
    setPredictions([]);
    setHighlightedIndex(-1);
    setIsSearchFocused(false);

    if (!map) {
      return;
    }

    try {
      if (prediction.nextPrediction) {
        const place = prediction.nextPrediction.toPlace();

        await place.fetchFields({
          fields: ['location', 'viewport'],
        });

        if (place.location) {
          await applySelectedLocation(place.location, place.viewport ?? null);
        }
      } else if (prediction.placeId) {
        const resolved = await resolveLegacyPredictionLocation(
          prediction.placeId,
        );

        if (resolved) {
          await applySelectedLocation(resolved.location, resolved.viewport);
        }
      }

      autocompleteSessionTokenRef.current = null;
    } catch (error) {
      console.error('Failed to fetch place details', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (predictions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : predictions.length - 1,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex > -1) {
          handlePredictionClick(predictions[highlightedIndex]);
        } else if (predictions[0]) {
          handlePredictionClick(predictions[0]);
        }
      }
    }
  };

  const handleToolSelect = (tool: string | null) => {
    clearDrawing();

    if (!tool) {
      setDrawingMode(null);
      return;
    }

    const resolvedMode = DRAWING_MODE_BY_TOOL[tool as ToolDrawingMode] ?? null;
    setDrawingMode(resolvedMode);
  };

  // `newRadius` is in meters (the unit Google Maps' Circle API expects);
  // the UI converts to/from kilometers for display.
  const handleRadiusChange = (newRadius: number) => {
    if (drawnOverlayRef.current && value?.type === 'circle') {
      const radius = Math.max(newRadius, METERS_PER_KM);
      (drawnOverlayRef.current as google.maps.Circle).setRadius(radius);
      onChange({ ...value, radius });
    }
  };

  // `newRadiusMeters` is the target average distance from the polygon's
  // centroid to its vertices; the polygon is uniformly scaled to match it.
  const handlePolygonRadiusChange = (newRadiusMeters: number) => {
    if (
      drawnOverlayRef.current &&
      value?.type === 'polygon' &&
      value.path &&
      value.path.length > 0
    ) {
      const polygon = drawnOverlayRef.current as google.maps.Polygon;
      const currentPath = normalizePolygonPath(
        polygon
          .getPath()
          .getArray()
          .map((point: google.maps.LatLng) => point.toJSON()),
      );

      const currentRadius = getPathAverageRadiusMeters(currentPath);
      if (currentRadius <= 0) {
        return;
      }

      const targetRadius = Math.max(newRadiusMeters, METERS_PER_KM);
      const scaleFactor = targetRadius / currentRadius;
      const centroid = getPathCentroid(currentPath);

      const newPath = currentPath.map((point: LatLngPoint) => {
        const latOffset = point.lat - centroid.lat;
        const lngOffset = point.lng - centroid.lng;
        return {
          lat: centroid.lat + latOffset * scaleFactor,
          lng: centroid.lng + lngOffset * scaleFactor,
        };
      });

      polygon.setPath(newPath);
      const updatedPath = normalizePolygonPath(newPath);
      onChange({ ...value, path: updatedPath });
    }
  };

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!map || !event.latLng || isSearchFocused) {
        return;
      }

      const mode = drawingModeRef.current;
      if (!mode) {
        return;
      }

      if (mode === 'polygon') {
        await createRegularPolygon(event.latLng, map);
        return;
      }

      if (mode === 'circle') {
        await createCircleAt(event.latLng, map);
        return;
      }

      if (mode === 'marker') {
        await createMarkerAt(event.latLng, map);
        return;
      }

      if (mode === 'polyline') {
        await handlePolylineDrawingClick(event.latLng, map);
      }
    },
    [
      createCircleAt,
      createMarkerAt,
      createRegularPolygon,
      handlePolylineDrawingClick,
      isSearchFocused,
      map,
    ],
  );

  const handleMapMouseMove = useCallback((event: google.maps.MapMouseEvent) => {
    if (
      drawingModeRef.current !== 'polyline' ||
      !draftPolylineRef.current ||
      !event.latLng
    ) {
      return;
    }

    const firstPoint = draftPolylinePathRef.current[0];
    if (!firstPoint) {
      return;
    }

    draftPolylineRef.current.setPath([firstPoint, event.latLng]);
  }, []);

  if (!googleMapsApiKey) {
    return (
      <DisplayError
        title={t('missingApiKeyTitle')}
        message={t('missingApiKeyMessage')}
      />
    );
  }

  if (loadError) {
    const isRefererError = isGoogleMapsRefererNotAllowedError(loadError);
    return (
      <DisplayError
        title={
          isRefererError ? t('refererNotAllowedTitle') : t('loadFailedTitle')
        }
        message={
          isRefererError
            ? t('refererNotAllowedMessage')
            : t('loadFailedMessage')
        }
      />
    );
  }

  return isLoaded ? (
    <div className="space-y-4 relative">
      <div className="absolute top-2 left-1/2 z-20 w-full -translate-x-1/2 px-4">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 flex w-full items-center ltr:left-0 ltr:right-0 ltr:pl-3 rtl:left-0 rtl:right-0 rtl:pr-3">
            <LocateIcon size={20} className="text-gray-400" />
          </div>
          <Input
            placeholder={t('searchPlaceholder')}
            className="h-11 w-full bg-white pl-10 rtl:pl-3 rtl:pr-10 rtl:text-right"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={handleKeyDown}
          />
          {isSearchFocused && predictions.length > 0 && (
            <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.id}
                  className={`p-2 cursor-pointer ${
                    index === highlightedIndex
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-100'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePredictionClick(prediction);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {prediction.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={DEFAULT_CENTER}
        zoom={8}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        options={{
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
          },
          zoomControl: !hideZoomControls,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: false,
          fullscreenControl: false,
        }}
        mapContainerClassName="rounded-md"
      />
      {onExactStoreLocationChange && (
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <Label className="block">
                {exactStoreLocationLabel || 'Exact Store Location'}
              </Label>
              {exactStoreLocation ? (
                <AppButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!zoneCenter}
                  onClick={handleRecenterToExactLocation}
                >
                  Recenter the store marker
                </AppButton>
              ) : (
                <AppButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!zoneCenter}
                  onClick={handleUseZoneCenterForExactLocation}
                >
                  Add the store marker
                </AppButton>
              )}
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              {exactStoreLocationDescription ||
                'Search and select the exact store location to place a marker.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs">
                {exactStoreLocationLatitudeLabel || 'Latitude'}
              </Label>
              <Input
                value={exactStoreLocation?.latitude ?? ''}
                readOnly
                placeholder="--"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">
                {exactStoreLocationLongitudeLabel || 'Longitude'}
              </Label>
              <Input
                value={exactStoreLocation?.longitude ?? ''}
                readOnly
                placeholder="--"
              />
            </div>
          </div>
        </div>
      )}
      {value?.type === 'circle' && (
        <div className="flex items-center gap-2">
          <Label>{t('radiusLabel', { defaultValue: 'Radius (km)' })}</Label>
          <AppButton
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleRadiusChange((value.radius || 0) - METERS_PER_KM);
            }}
          >
            <Minus size={16} />
          </AppButton>
          <Input
            type="number"
            min={1}
            value={Math.round((value.radius || 0) / METERS_PER_KM)}
            onChange={(e) =>
              handleRadiusChange(Number(e.target.value) * METERS_PER_KM)
            }
            className="w-24"
          />
          <AppButton
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleRadiusChange((value.radius || 0) + METERS_PER_KM);
            }}
          >
            <Plus size={16} />
          </AppButton>
        </div>
      )}
      {value?.type === 'polygon' && (
        <div className="flex items-center gap-2">
          <Label>
            {t('polygonRadiusLabel', { defaultValue: 'Radius (km)' })}
          </Label>
          <AppButton
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePolygonRadiusChange(
                getPathAverageRadiusMeters(value.path ?? []) - METERS_PER_KM,
              );
            }}
          >
            <Minus size={16} />
          </AppButton>
          <Input
            type="number"
            min={1}
            value={Math.round(
              getPathAverageRadiusMeters(value.path ?? []) / METERS_PER_KM,
            )}
            onChange={(e) =>
              handlePolygonRadiusChange(Number(e.target.value) * METERS_PER_KM)
            }
            className="w-24"
          />
          <AppButton
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePolygonRadiusChange(
                getPathAverageRadiusMeters(value.path ?? []) + METERS_PER_KM,
              );
            }}
          >
            <Plus size={16} />
          </AppButton>
          <span className="text-sm text-gray-600">
            {t('dragVertices', {
              defaultValue: 'Drag vertices or use buttons',
            })}
          </span>
        </div>
      )}
      <DrawingTools tool={value?.type} onToolSelect={handleToolSelect} />
    </div>
  ) : (
    <p>{t('loading')}</p>
  );
}
