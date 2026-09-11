export interface LatLngPoint {
  lat: number;
  lng: number;
}

export const areLatLngPointsEqual = (
  first: LatLngPoint | undefined,
  second: LatLngPoint | undefined,
) =>
  Boolean(
    first &&
    second &&
    first.lat === second.lat &&
    first.lng === second.lng,
  );

export const normalizePolygonPath = (
  path: LatLngPoint[] | null | undefined,
): LatLngPoint[] => {
  if (!Array.isArray(path) || path.length === 0) {
    return [];
  }

  const sanitizedPath = path.map(({ lat, lng }) => ({ lat, lng }));
  const firstPoint = sanitizedPath[0];
  const lastPoint = sanitizedPath[sanitizedPath.length - 1];

  if (areLatLngPointsEqual(firstPoint, lastPoint)) {
    return sanitizedPath.slice(0, -1);
  }

  return sanitizedPath;
};

export const closePolygonPath = (
  path: LatLngPoint[] | null | undefined,
): LatLngPoint[] => {
  const normalizedPath = normalizePolygonPath(path);

  if (normalizedPath.length === 0) {
    return [];
  }

  return [...normalizedPath, { ...normalizedPath[0] }];
};
