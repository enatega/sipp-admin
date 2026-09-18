import type { StoreTimings } from '@/shared/contracts/store';
import { GetStoreDetailResponse } from '@/types';
import { ZoneData } from '@/components/shared/maps/InteractiveMap';
import { Store } from './types';

export function mapStoreApiToForm(apiData: GetStoreDetailResponse): Store {
  const toNumber = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseMaybeJson = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const parseDeep = (value: unknown): unknown => {
    let current = value;
    for (let i = 0; i < 3; i += 1) {
      const parsed = parseMaybeJson(current);
      if (parsed === current) break;
      current = parsed;
    }
    return current;
  };

  const mapCircleShapeToZone = (shape: unknown): ZoneData | null => {
    const circle = shape as
      | {
          type?: string;
          center?:
            | {
                lat?: unknown;
                lng?: unknown;
                latitude?: unknown;
                longitude?: unknown;
              }
            | unknown[];
          radius?: unknown;
        }
      | null
      | undefined;

    if (!circle || circle.type !== 'Circle') return null;

    const centerRaw = circle.center;
    const center = Array.isArray(centerRaw)
      ? { lng: toNumber(centerRaw[0]), lat: toNumber(centerRaw[1]) }
      : {
          lng: toNumber(centerRaw?.lng ?? centerRaw?.longitude),
          lat: toNumber(centerRaw?.lat ?? centerRaw?.latitude),
        };

    const radius = toNumber(circle.radius);
    if (center.lng === null || center.lat === null || radius === null) {
      return null;
    }

    return {
      type: 'circle',
      center: { lng: center.lng, lat: center.lat },
      radius,
    };
  };

  const mapPointShapeToZone = (shape: unknown): ZoneData | null => {
    const point = shape as
      { type?: string; coordinates?: unknown } | null | undefined;
    if (!point || point.type !== 'Point' || !Array.isArray(point.coordinates)) {
      return null;
    }

    const lng = toNumber(point.coordinates[0]);
    const lat = toNumber(point.coordinates[1]);
    if (lng === null || lat === null) return null;

    return {
      type: 'marker',
      center: { lng, lat },
    };
  };

  const mapPolygonShapeToZone = (shape: unknown): ZoneData | null => {
    const polygon = shape as
      { type?: string; coordinates?: unknown } | null | undefined;
    if (
      !polygon ||
      polygon.type !== 'Polygon' ||
      !Array.isArray(polygon.coordinates)
    ) {
      return null;
    }

    const coordsRaw = parseDeep(polygon.coordinates);
    if (!Array.isArray(coordsRaw)) return null;

    // Supports both GeoJSON Polygon [[[lng,lat],...]] and [ [lng,lat], ... ]
    const ring = Array.isArray(coordsRaw[0]?.[0]) ? coordsRaw[0] : coordsRaw;
    if (!Array.isArray(ring)) return null;

    const path = ring
      .map((coord) => {
        if (!Array.isArray(coord)) return null;
        const lng = toNumber(coord[0]);
        const lat = toNumber(coord[1]);
        if (lng === null || lat === null) return null;
        return { lng, lat };
      })
      .filter((item): item is { lng: number; lat: number } => item !== null);

    if (path.length === 0) return null;
    return { type: 'polygon', path };
  };

  const mapLineStringShapeToZone = (shape: unknown): ZoneData | null => {
    const line = shape as
      { type?: string; coordinates?: unknown } | null | undefined;
    const coordsRaw = parseDeep(line?.coordinates);
    if (!line || line.type !== 'LineString' || !Array.isArray(coordsRaw)) {
      return null;
    }

    const path = coordsRaw
      .map((coord) => {
        if (!Array.isArray(coord)) return null;
        const lng = toNumber(coord[0]);
        const lat = toNumber(coord[1]);
        if (lng === null || lat === null) return null;
        return { lng, lat };
      })
      .filter((item): item is { lng: number; lat: number } => item !== null);

    if (path.length === 0) return null;
    return { type: 'polyline', path };
  };

  const mapAnyShapeToZone = (raw: unknown): ZoneData | null => {
    const parsed = parseDeep(raw);
    const asObj = parsed as
      | {
          shape?: unknown;
          type?: string;
          geometry?: unknown;
          features?: Array<{ geometry?: unknown }>;
        }
      | null
      | undefined;

    let shape: unknown = asObj?.shape ?? parsed;
    if (asObj?.type === 'Feature') {
      shape = asObj.geometry ?? shape;
    } else if (asObj?.type === 'FeatureCollection') {
      shape = asObj.features?.[0]?.geometry ?? shape;
    }

    shape = parseDeep(shape);
    if (!shape || typeof shape !== 'object') return null;

    return (
      mapPointShapeToZone(shape) ??
      mapPolygonShapeToZone(shape) ??
      mapLineStringShapeToZone(shape) ??
      mapCircleShapeToZone(shape)
    );
  };

  let location: ZoneData | null = null;
  // IMPORTANT:
  // Store delivery bounds must come from store-specific location keys only.
  // Do not fallback to selected zone geometry keys (zonepolygon/circledata).
  location =
    mapAnyShapeToZone(apiData.addresszonepolygon) ??
    mapAnyShapeToZone(apiData.addresscircledata);

  const storeTimings: StoreTimings = {
    monday: apiData.storetimings?.monday || { is_active: false, slots: [] },
    tuesday: apiData.storetimings?.tuesday || { is_active: false, slots: [] },
    wednesday: apiData.storetimings?.wednesday || {
      is_active: false,
      slots: [],
    },
    thursday: apiData.storetimings?.thursday || { is_active: false, slots: [] },
    friday: apiData.storetimings?.friday || { is_active: false, slots: [] },
    saturday: apiData.storetimings?.saturday || { is_active: false, slots: [] },
    sunday: apiData.storetimings?.sunday || { is_active: false, slots: [] },
  };

  const latitude = Number(apiData.latitude);
  const longitude = Number(apiData.longitude);
  const exactStoreLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;

  return {
    id: apiData.id,
    name: apiData.storename,
    vendorId: '', // Not provided by API
    phone: apiData.storephone ?? '',
    email: apiData.storeemail ?? '',
    logo: apiData.logo || null,
    banner: apiData.banner || null,
    zoneId: apiData.zoneid ?? '',
    minimumOrderValue: apiData.minimumorder,
    tagLine: apiData.tagline || '',
    description: apiData.description || '',
    address: apiData.address,
    shopType: apiData.shoptypeid,
    productTaxMode: apiData.productTaxMode || 'store_rate',
    taxRateId: apiData.taxRateId || '',
    storeType: 'independent', // Default, not provided by API
    location,
    exactStoreLocation,
    storeTimings,

    // Store Operations
    prepareTime: apiData.preparetime,
    packingCharges: String(apiData.packingcharges),
    scheduleBooking: apiData.allowschedulebooking,
    pickupAllowed: apiData.pickupallow,
    deliveryAllowed: apiData.deliveryallow,
    baseFee: String(apiData.basefee),
    perKmFee: String(apiData.perkmfee),
    freeDeliveryThreshold: String(apiData.freedeliverythreshold),

    // Bank Details
    bankName: apiData.bankname ?? '',
    accountHolderName: apiData.accountholdername ?? '',
    accountNumber: apiData.accountnumber ?? '',
    branchCode: apiData.branchcode ?? '',

    // Documents (URLs from API)
    businessLicenseFront: apiData.businesslicencefront,
    businessLicenseBack: apiData.businesslicenceback,
    identityCardFront: apiData.nationalidfront,
    identityCardBack: apiData.nationalidback,
    storeRegistrationDoc: apiData.registereddocs,
    taxCertificate: apiData.taxidcertificate,

    // These fields are not editable in edit mode
    password: '',
    autoGeneratePassword: false,
    changePassword: false,
    mailLoginCredentials: false,
  };
}
