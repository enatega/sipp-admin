import {
  CustomCircle,
  ZoneShapeKind,
  ZoneGeoJsonPolygon,
} from '@/shared/contracts/zones';

export interface DeliveriesZone extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  zoneType: string[];
  createdAt: string;
  zoneShape: ZoneShapeKind;
  zonePolygon: ZoneGeoJsonPolygon | null;
  circleData: CustomCircle | null;
}
