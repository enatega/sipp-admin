import {
  CustomCircle,
  TZoneShapes,
  ZoneGeoJsonPolygon,
} from '@/shared/contracts/zones';
import {
  Zone,
  ZoneType,
} from '@/types/entities/super-admin/general/zones';

export interface PostZonePayload {
    title: string;
    description: string;
    zoneType: ZoneType[];
    zoneShape: TZoneShapes;
    shape?: {
        type: TZoneShapes;
        coordinates?: ZoneGeoJsonPolygon | ZoneGeoJsonPolygon[] | null;
        center?: { lat: number; lng: number } | null;
        radius?: number | null;
    } | null;

}

export interface PutZonePayload {
    id: string;
    title: string;
    description: string;
    zoneType: ZoneType[];
    zoneShape: TZoneShapes;
    zonePolygon?: {
        type: TZoneShapes;
        coordinates: ZoneGeoJsonPolygon;
    } | null;
    circleData?: CustomCircle | null;
}

export type PostZoneResponse = Zone;

export interface GetZonesQueryParams {
    offset?: number;
    page?: number;
    limit?: number;
    zoneType?: ZoneType;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface GetZonesResponse {
    zones: Zone[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface DeleteZoneResponse {
    message: string;
}

export interface ZoneSimpleItem {
    id: string;
    title: string;
}

export type GetZonesSimpleResponse = ZoneSimpleItem[];
