import type { ZoneBoundsResponse } from '@/types';
import type { ExactStoreLocation } from '@/components/shared/maps/InteractiveMap';

const EARTH_RADIUS_METERS = 6_371_000;
const COORDINATE_EPSILON = 1e-9;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceMeters = (
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
) => {
  const latitudeDelta = toRadians(second.lat - first.lat);
  const longitudeDelta = toRadians(second.lng - first.lng);
  const firstLatitude = toRadians(first.lat);
  const secondLatitude = toRadians(second.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
};

const isPointOnSegment = (
  point: number[],
  segmentStart: number[],
  segmentEnd: number[],
) => {
  const [pointX, pointY] = point;
  const [startX, startY] = segmentStart;
  const [endX, endY] = segmentEnd;
  const crossProduct =
    (pointY - startY) * (endX - startX) - (pointX - startX) * (endY - startY);

  if (Math.abs(crossProduct) > COORDINATE_EPSILON) return false;

  return (
    pointX >= Math.min(startX, endX) - COORDINATE_EPSILON &&
    pointX <= Math.max(startX, endX) + COORDINATE_EPSILON &&
    pointY >= Math.min(startY, endY) - COORDINATE_EPSILON &&
    pointY <= Math.max(startY, endY) + COORDINATE_EPSILON
  );
};

const isPointInRing = (point: number[], ring: number[][]) => {
  let isInside = false;

  for (
    let current = 0, previous = ring.length - 1;
    current < ring.length;
    previous = current++
  ) {
    const currentPoint = ring[current];
    const previousPoint = ring[previous];

    if (isPointOnSegment(point, previousPoint, currentPoint)) return true;

    const intersects =
      currentPoint[1] > point[1] !== previousPoint[1] > point[1] &&
      point[0] <
        ((previousPoint[0] - currentPoint[0]) * (point[1] - currentPoint[1])) /
          (previousPoint[1] - currentPoint[1]) +
          currentPoint[0];

    if (intersects) isInside = !isInside;
  }

  return isInside;
};

export const zoneContainsStoreLocation = (
  zone: ZoneBoundsResponse,
  storeLocation: ExactStoreLocation,
) => {
  if (zone.zoneShape === 'Circle' && zone.circleData) {
    return (
      getDistanceMeters(zone.circleData.center, {
        lat: storeLocation.latitude,
        lng: storeLocation.longitude,
      }) <= zone.circleData.radius
    );
  }

  if (!zone.zonePolygon) return false;

  const point = [storeLocation.longitude, storeLocation.latitude];

  if (zone.zonePolygon.type === 'Point') {
    const coordinates = zone.zonePolygon.coordinates as number[];
    return (
      Math.abs(coordinates[0] - point[0]) <= COORDINATE_EPSILON &&
      Math.abs(coordinates[1] - point[1]) <= COORDINATE_EPSILON
    );
  }

  if (zone.zonePolygon.type === 'LineString') {
    const coordinates = zone.zonePolygon.coordinates as number[][];
    return coordinates
      .slice(1)
      .some((coordinate, index) =>
        isPointOnSegment(point, coordinates[index], coordinate),
      );
  }

  if (zone.zonePolygon.type === 'Polygon') {
    const rings = zone.zonePolygon.coordinates as number[][][];
    if (!rings[0] || !isPointInRing(point, rings[0])) return false;

    return !rings.slice(1).some((ring) => isPointInRing(point, ring));
  }

  return false;
};
