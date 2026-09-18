import { DayTimings } from '@/shared/contracts/store';

export interface StoreTimingsResponse {
  monday?: DayTimings;
  tuesday?: DayTimings;
  wednesday?: DayTimings;
  thursday?: DayTimings;
  friday?: DayTimings;
  saturday?: DayTimings;
  sunday?: DayTimings;
}

export interface GetStoreDetailResponse {
  isLegacyMigrated?: boolean;
  storeLoginEnabled?: boolean;
  productTaxMode?: 'store_rate' | 'product_level';
  taxRateId?: string | null;
  taxRate?: import('@/types/tax').TaxRate | null;
  id: string;
  address: string;
  deliverytime: string;
  minimumorder: string;
  salestax: string;
  basefee: number;
  perkmfee: number;
  freedeliverythreshold: number;
  packingcharges: number;
  preparetime: string;
  allowschedulebooking: boolean;
  pickupallow: boolean;
  deliveryallow: boolean;
  storetimings: StoreTimingsResponse;
  status: string;
  isavailable: boolean;
  addresszoneshape: string | null;
  addresszonepolygon:
    | string
    | {
        type?: 'Point' | 'Polygon' | 'LineString' | 'Circle' | string;
        coordinates?: number[] | number[][] | number[][][];
        center?:
          | {
              lat?: number | string | null;
              lng?: number | string | null;
              latitude?: number | string | null;
              longitude?: number | string | null;
            }
          | [number | string, number | string]
          | null;
        radius?: number | string | null;
        shape?: unknown;
      }
    | null;
  addresscircledata:
    | string
    | {
        type?: 'Circle' | string;
        center?:
          | {
              lat?: number | string | null;
              lng?: number | string | null;
              latitude?: number | string | null;
              longitude?: number | string | null;
            }
          | [number | string, number | string]
          | null;
        radius?: number | string | null;
      }
    | null;
  addresszonetype: string[] | null;
  logo: string | null;
  banner: string | null;
  businesslicencefront: string | null;
  businesslicenceback: string | null;
  nationalidfront: string | null;
  nationalidback: string | null;
  registereddocs: string | null;
  taxidcertificate: string | null;
  bankname: string;
  accountholdername: string;
  accountnumber: string;
  branchcode: string;
  storename: string;
  storeemail: string;
  storephone: string;
  shoptypeid: string;
  shoptypename: string;
  zonetitle: string;
  zoneid: string;
  zoneshape: string | null;
  zonepolygon:
    | string
    | {
        type?: 'Point' | 'Polygon' | 'LineString' | 'Circle' | string;
        coordinates?: number[] | number[][] | number[][][];
        center?:
          | {
              lat?: number | string | null;
              lng?: number | string | null;
              latitude?: number | string | null;
              longitude?: number | string | null;
            }
          | [number | string, number | string]
          | null;
        radius?: number | string | null;
        shape?: unknown;
      }
    | null;
  circledata:
    | string
    | {
        type?: 'Circle' | string;
        center?:
          | {
              lat?: number | string | null;
              lng?: number | string | null;
              latitude?: number | string | null;
              longitude?: number | string | null;
            }
          | [number | string, number | string]
          | null;
        radius?: number | string | null;
      }
    | null;
  zonetype: string[] | null;
  tagline?: string;
  description?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}
