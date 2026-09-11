import {
  CustomCircle,
  TZoneShapes,
  ZoneGeoJsonPolygon,
} from '@/shared/contracts/zones';
import { DeliveriesZone } from '@/types/entities/super-admin/general/deliveries-zones';

export interface DeliveriesZoneShapePayload {
  type: TZoneShapes;
  coordinates?: ZoneGeoJsonPolygon | null;
  center?: {
    lat: number;
    lng: number;
  } | null;
  radius?: number | null;
}

export interface PostDeliveriesZonePayload {
  title: string;
  description: string;
  zoneType: string[];
  shape: DeliveriesZoneShapePayload;
}

export interface PutDeliveriesZonePayload {
  id: string;
  title: string;
  description: string;
  zoneType: string[];
  zoneShape: TZoneShapes;
  zonePolygon?: {
    type: TZoneShapes;
    coordinates: ZoneGeoJsonPolygon;
  } | null;
  circleData?: CustomCircle | null;
}

export interface GetDeliveriesZonesQueryParams {
  page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetDeliveriesZonesResponse {
  zones: DeliveriesZone[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DeleteDeliveriesZoneResponse {
  message: string;
}


export interface UpdateGeneralBookingZonePayload {
  id: string;
  title: string;
  description: string;
  addressString?: string;
  zoneType: string[];
  zonePolygon?: {
    type: TZoneShapes;
    coordinates: ZoneGeoJsonPolygon;
  } | null;
  zoneShape: TZoneShapes;
  circleData?: CustomCircle | null;
}
