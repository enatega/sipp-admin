'use client';

import {
  CustomCircle,
  DeliveriesZone,
  TZoneShapes,
  ZoneGeoJsonPolygon,
} from '@/types';
import { ZoneData } from '@/components/super-admin/general/zones/common/InteractiveMap';

export interface DeliveriesZoneFormValues {
  title: string;
  description: string;
  zoneData: ZoneData | null;
}

interface ShapePayload {
  type: TZoneShapes;
  coordinates?: ZoneGeoJsonPolygon | null;
  center?: { lat: number; lng: number } | null;
  radius?: number | null;
}

export interface ConvertedDeliveriesUpdateShape {
  zoneShape: TZoneShapes;
  zonePolygon?: {
    type: TZoneShapes;
    coordinates: ZoneGeoJsonPolygon;
  } | null;
  circleData?: CustomCircle | null;
}

export const convertZoneDataToCreateShape = (
  zoneData: ZoneData | null,
): ShapePayload | null => {
  if (!zoneData?.type) return null;

  if (zoneData.type === 'marker' && zoneData.center) {
    return {
      type: 'Point',
      coordinates: [zoneData.center.lng, zoneData.center.lat],
    };
  }

  if (zoneData.type === 'polyline' && zoneData.path) {
    return {
      type: 'LineString',
      coordinates: zoneData.path.map(({ lat, lng }) => [lng, lat]),
    };
  }

  if (zoneData.type === 'polygon' && zoneData.path) {
    const coordinates = zoneData.path.map(({ lat, lng }) => [lng, lat]);

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }

  if (zoneData.type === 'circle' && zoneData.center && zoneData.radius) {
    return {
      type: 'Circle',
      center: { lat: zoneData.center.lat, lng: zoneData.center.lng },
      radius: zoneData.radius,
    };
  }

  return null;
};

export const convertZoneDataToUpdatePayload = (
  zoneData: ZoneData | null,
): ConvertedDeliveriesUpdateShape | null => {
  if (!zoneData?.type) return null;

  if (zoneData.type === 'marker' && zoneData.center) {
    return {
      zoneShape: 'Point',
      zonePolygon: {
        type: 'Point',
        coordinates: [zoneData.center.lng, zoneData.center.lat],
      },
    };
  }

  if (zoneData.type === 'polyline' && zoneData.path) {
    return {
      zoneShape: 'LineString',
      zonePolygon: {
        type: 'LineString',
        coordinates: zoneData.path.map(({ lat, lng }) => [lng, lat]),
      },
    };
  }

  if (zoneData.type === 'polygon' && zoneData.path) {
    const coordinates = zoneData.path.map(({ lat, lng }) => [lng, lat]);

    return {
      zoneShape: 'Polygon',
      zonePolygon: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    };
  }

  if (zoneData.type === 'circle' && zoneData.center && zoneData.radius) {
    return {
      zoneShape: 'Circle',
      circleData: {
        type: 'Circle',
        center: { lat: zoneData.center.lat, lng: zoneData.center.lng },
        radius: zoneData.radius,
      },
    };
  }

  return null;
};

export const convertZoneToZoneData = (
  zone: DeliveriesZone,
): ZoneData | null => {
  if (zone.zoneShape === 'Point' && zone.zonePolygon) {
    const point = zone.zonePolygon as unknown;
    if (
      !Array.isArray(point) ||
      point.length < 2 ||
      typeof point[0] !== 'number' ||
      typeof point[1] !== 'number'
    ) {
      return null;
    }

    return {
      type: 'marker',
      center: { lat: point[1], lng: point[0] },
    };
  }

  if (zone.zoneShape === 'LineString' && zone.zonePolygon) {
    const line = zone.zonePolygon as unknown;
    if (
      !Array.isArray(line) ||
      line.length === 0 ||
      !Array.isArray(line[0])
    ) {
      return null;
    }

    const path = (line as unknown[]).flatMap((pair) => {
      if (
        Array.isArray(pair) &&
        pair.length >= 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number'
      ) {
        const [lng, lat] = pair;
        return [{ lat, lng }];
      }
      return [];
    });

    if (path.length < 2) return null;

    return { type: 'polyline', path };
  }

  if (zone.zoneShape === 'Polygon' && zone.zonePolygon) {
    const polygon = zone.zonePolygon as unknown;

    const extractFirstRing = (input: unknown): unknown[] | null => {
      if (!Array.isArray(input) || input.length === 0) return null;
      const first = input[0];

      if (Array.isArray(first) && typeof first[0] === 'number') {
        return input as unknown[];
      }

      if (Array.isArray(first) && Array.isArray(first[0])) {
        const firstRing = first as unknown;
        if (
          Array.isArray(firstRing) &&
          firstRing.length > 0 &&
          Array.isArray(firstRing[0])
        ) {
          const maybePair = (firstRing as unknown[])[0] as unknown;
          if (Array.isArray(maybePair) && typeof maybePair[0] === 'number') {
            return firstRing as unknown[];
          }

          const maybePolygon = first as unknown[];
          const maybeRing = maybePolygon?.[0];
          if (
            Array.isArray(maybeRing) &&
            maybeRing.length > 0 &&
            Array.isArray(maybeRing[0]) &&
            typeof (maybeRing[0] as unknown[])[0] === 'number'
          ) {
            return maybeRing as unknown[];
          }
        }
      }

      return null;
    };

    const ring = extractFirstRing(polygon);
    if (!ring) return null;

    const path = ring.flatMap((pair) => {
      if (
        Array.isArray(pair) &&
        pair.length >= 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number'
      ) {
        const [lng, lat] = pair;
        return [{ lat, lng }];
      }
      return [];
    });

    if (path.length < 3) return null;

    return { type: 'polygon', path };
  }

  if (zone.zoneShape === 'Circle' && zone.circleData) {
    return {
      type: 'circle',
      center: zone.circleData.center,
      radius: zone.circleData.radius,
    };
  }

  return null;
};
