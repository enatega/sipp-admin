import { ZoneData } from '@/components/shared/maps/InteractiveMap';
import { IGetStoreLocationResponse } from '@/types/api/store/deliveries/store-location';
import { ZoneBoundsResponse } from '@/types';

const toMapPoint = (coordinate: number[]) => ({
  lat: coordinate[1],
  lng: coordinate[0],
});

export const mapStoreLocationToZoneData = (
  data: IGetStoreLocationResponse,
): ZoneData | null => {
  if (!data) return null;

  if (data.address_circle_data) {
    const circle = data.address_circle_data;

    return {
      type: 'circle',
      center: circle.center,
      radius: circle.radius,
    };
  }

  if (!data.address_zone_polygon) return null;

  const polygon = data.address_zone_polygon;

  if (polygon.type === 'Point') {
    const coords = polygon.coordinates as number[];

    return {
      type: 'marker',
      center: {
        lat: coords[1],
        lng: coords[0],
      },
    };
  }

  if (polygon.type === 'Polygon') {
    const coordinates = polygon.coordinates as number[][][];

    const path = coordinates[0]?.map((coord) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    return {
      type: 'polygon',
      path,
    };
  }

  if (polygon.type === 'LineString') {
    const coordinates = polygon.coordinates as number[][];

    const path = coordinates.map((coord) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    return {
      type: 'polyline',
      path,
    };
  }

  return null;
};

export const mapZoneBoundsToZoneData = (
  zone: ZoneBoundsResponse,
): ZoneData | null => {
  if (zone.zoneShape === 'Circle' && zone.circleData) {
    return {
      type: 'circle',
      center: zone.circleData.center,
      radius: zone.circleData.radius,
    };
  }

  if (!zone.zonePolygon) return null;

  if (zone.zonePolygon.type === 'Point') {
    const coordinates = zone.zonePolygon.coordinates as number[];
    if (coordinates.length < 2) return null;

    return { type: 'marker', center: toMapPoint(coordinates) };
  }

  if (zone.zonePolygon.type === 'Polygon') {
    const coordinates = zone.zonePolygon.coordinates as number[][][];
    const path = coordinates[0]?.map(toMapPoint);
    if (!path || path.length < 3) return null;

    return { type: 'polygon', path };
  }

  if (zone.zonePolygon.type === 'LineString') {
    const coordinates = zone.zonePolygon.coordinates as number[][];
    const path = coordinates.map(toMapPoint);
    if (path.length < 2) return null;

    return { type: 'polyline', path };
  }

  return null;
};
