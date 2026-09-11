export type ZoneType = "food" | "drive" | "hotel" | "ticket";

// GeoJSON Point
export type GeoJsonPoint = number[];

// GeoJSON LineString (for Wayline)
export type GeoJsonLineString = number[][];

// GeoJSON Polygon
export type GeoJsonPolygon = number[][] | number[][][];


// Custom Circle representation
export interface CustomCircle {
    type: "Circle";
    center: { lat: number; lng: number };
    radius: number; // in meters
}

// This will be used for the 'shape' field in PostZonePayload
export type ZoneShapeData = GeoJsonPoint | GeoJsonLineString | GeoJsonPolygon | CustomCircle;

// This will be used for the 'zonePolygon' field in Zone and PutZonePayload (for non-circle shapes)
export type ZoneGeoJsonPolygon = GeoJsonPoint | GeoJsonLineString | GeoJsonPolygon | GeoJsonPolygon[];

export type TZoneShapes = "Point" | "LineString" | "Polygon" | "Circle";

export interface Zone extends Record<string, unknown> {
    id: string;
    title: string;
    description: string;
    zoneType: ZoneType[];
    createdAt: string;
    zoneShape: TZoneShapes;
    zonePolygon: ZoneGeoJsonPolygon | null;
    circleData: CustomCircle | null;
}
