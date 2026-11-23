import type { StoreTimings } from '@/shared/contracts/store';
import { GetStoreDetailResponse } from '@/types';
import { VendorStore } from './types';

export function mapVendorStoreData(
  apiData: GetStoreDetailResponse,
): VendorStore {
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

  let location: VendorStore['location'] = null;

  const locationSource = apiData.addresszoneshape === 'Circle'
    ? apiData.addresscircledata ?? apiData.addresszonepolygon
    : apiData.addresszonepolygon ?? apiData.addresscircledata;
  if (locationSource) {
    try {
      const parsed = parseDeep(locationSource) as {
        type?: string;
        coordinates?: unknown;
        center?: unknown;
        radius?: unknown;
      };

      if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
        const lng = toNumber(parsed.coordinates[0]);
        const lat = toNumber(parsed.coordinates[1]);
        if (lng === null || lat === null) {
          location = null;
        } else {
          location = {
            type: 'marker',
            center: {
              lng,
              lat,
            },
          };
        }
      } else if (
        parsed.type === 'Polygon' &&
        Array.isArray(parsed.coordinates)
      ) {
        const polygonCoords = Array.isArray(parsed.coordinates[0]?.[0])
          ? parsed.coordinates[0]
          : parsed.coordinates;
        location = {
          type: 'polygon',
          path: polygonCoords
            .map((coord: unknown) => {
              if (!Array.isArray(coord)) return null;
              const lng = toNumber(coord[0]);
              const lat = toNumber(coord[1]);
              if (lng === null || lat === null) return null;
              return { lng, lat };
            })
            .filter(
              (
                coord: { lng: number; lat: number } | null,
              ): coord is {
                lng: number;
                lat: number;
              } => coord !== null,
            ),
        };
      } else if (
        parsed.type === 'LineString' &&
        Array.isArray(parsed.coordinates)
      ) {
        location = {
          type: 'polyline',
          path: parsed.coordinates
            .map((coord: unknown) => {
              if (!Array.isArray(coord)) return null;
              const lng = toNumber(coord[0]);
              const lat = toNumber(coord[1]);
              if (lng === null || lat === null) return null;
              return { lng, lat };
            })
            .filter(
              (
                coord: { lng: number; lat: number } | null,
              ): coord is {
                lng: number;
                lat: number;
              } => coord !== null,
            ),
        };
      } else if (parsed.type === 'Circle') {
        const centerRaw = parsed.center;
        const center = Array.isArray(centerRaw)
          ? { lng: toNumber(centerRaw[0]), lat: toNumber(centerRaw[1]) }
          : {
              lng: toNumber(
                (
                  centerRaw as
                    { lng?: unknown; longitude?: unknown } | undefined
                )?.lng ??
                  (
                    centerRaw as
                      { lng?: unknown; longitude?: unknown } | undefined
                  )?.longitude,
              ),
              lat: toNumber(
                (centerRaw as { lat?: unknown; latitude?: unknown } | undefined)
                  ?.lat ??
                  (
                    centerRaw as
                      { lat?: unknown; latitude?: unknown } | undefined
                  )?.latitude,
              ),
            };
        const radius = toNumber(parsed.radius);
        if (center.lng === null || center.lat === null || radius === null) {
          location = null;
        } else {
          location = {
            type: 'circle',
            center: {
              lng: center.lng,
              lat: center.lat,
            },
            radius,
          };
        }
      }
    } catch {
      location = null;
    }
  }

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

  return {
    id: apiData.id,
    name: apiData.storename,
    phone: apiData.storephone ?? '',
    email: apiData.storeemail ?? '',
    logo: apiData.logo || null,
    banner: apiData.banner || null,
    zoneId: apiData.zoneid ?? '',
    minimumOrderValue: apiData.minimumorder || '0',
    tagLine: apiData.tagline || '',
    description: apiData.description || '',
    address: apiData.address || '',
    shopType: apiData.shoptypeid,
    productTaxMode: apiData.productTaxMode || 'store_rate',
    taxRateId: apiData.taxRateId || '',
    storeType: 'independent',
    storeTimings,
    location,
    prepareTime: apiData.preparetime ?? '',
    packingCharges: apiData.packingcharges
      ? String(apiData.packingcharges)
      : '',
    scheduleBooking: apiData.allowschedulebooking,
    pickupAllowed: apiData.pickupallow,
    deliveryAllowed: apiData.deliveryallow,
    baseFee: apiData.basefee ? String(apiData.basefee) : '',
    perKmFee: apiData.basefee ? String(apiData.perkmfee) : '',
    freeDeliveryThreshold: apiData.freedeliverythreshold
      ? String(apiData.freedeliverythreshold)
      : '',
    bankName: apiData.bankname ?? '',
    accountHolderName: apiData.accountholdername ?? '',
    accountNumber: apiData.accountnumber ?? '',
    branchCode: apiData.branchcode ?? '',
    businessLicenseFront: apiData.businesslicencefront,
    businessLicenseBack: apiData.businesslicenceback,
    identityCardFront: apiData.nationalidfront,
    identityCardBack: apiData.nationalidback,
    storeRegistrationDoc: apiData.registereddocs,
    taxCertificate: apiData.taxidcertificate,
    password: '',
    autoGeneratePassword: false,
    changePassword: false,
    mailLoginCredentials: false,
  };
}
