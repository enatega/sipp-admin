export type GeoJsonPoint = number[];
export type GeoJsonLineString = number[][];
export type GeoJsonPolygon = number[][] | number[][][];

export interface CustomCircle {
  type: 'Circle';
  center: { lat: number; lng: number };
  radius: number;
}

export type ZoneShapeData =
  | GeoJsonPoint
  | GeoJsonLineString
  | GeoJsonPolygon
  | CustomCircle;

export type ZoneGeoJsonPolygon =
  | GeoJsonPoint
  | GeoJsonLineString
  | GeoJsonPolygon
  | GeoJsonPolygon[];

export type ZoneShapeKind = 'Point' | 'LineString' | 'Polygon' | 'Circle';
