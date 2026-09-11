import { DeliveryRider } from '@/types/entities/super-admin/enatega-deliveries/rider';
import { VehicleType } from '@/types/entities/super-admin/enatega-deliveries/vehicle-type';

/**
 * Response type for vehicle types API - API returns array directly
 */
export type GetVehicleTypesResponse = VehicleType[];

/**
 * Query parameters for fetching riders
 */
export interface GetRidersQueryParams {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  kyc_status?: string;
  vehicle_type?: string;
  rating?: number;
  start_date?: string;
  end_date?: string;
  zoneIds?: string;
}

/**
 * Response type for fetching riders
 */
export interface GetDeliveryRidersResponse {
  riders: DeliveryRider[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Response type for delete rider
 */
export interface DeleteDeliveryRiderResponse {
  message: string;
}

/**
 * Payload for updating rider status
 */
export interface UpdateRiderStatusPayload {
  riderId: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

/**
 * Response type for updating rider status
 */
export interface UpdateRiderStatusResponse {
  message: string;
  riderId: string;
  status: string;
}

/**
 * Payload for blocking/unblocking rider
 */
export interface UpdateRiderBlockStatusPayload {
  riderId: string;
  blockStatus: boolean;
}

/**
 * Response type for blocking/unblocking rider
 */
export interface UpdateRiderBlockStatusResponse {
  message: string;
  riderId: string;
  blockStatus: boolean;
}

/**
 * Response type for fetching a single rider
 */
export interface GetDeliveryRiderResponse {
  rider: DeliveryRider;
  averageRatings: number | null;
  noOfReviews: number;
}

/**
 * Payload for updating rider
 */
export interface UpdateDeliveryRiderPayload {
  rider_id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  zone_id?: string;
  city?: string;
  licenseNumber?: string;
  vehicle_name?: string;
  vehicle_colour?: string;
  vehicle_no?: string;
  model_year_limit?: number;
  is_four_wheeler?: boolean;
  air_conditioning?: boolean;
  no_cosmetic_damage?: boolean;
  helmet?: boolean;
  availabilityStatus?: string;
  type?: string; // Vehicle type
  is_approved?: boolean;
  status?: string;
  tier_id?: string;
  is_onboarding_completed?: boolean;
  cod_limit_enabled?: boolean;
  cod_limit_amount?: number;
  cod_warning_threshold?: number;
  cod_auto_settlement_cycle?: string;
  cod_allow_online_payments_when_blocked?: boolean;
  driver_license_front?: File | string;
  driver_license_back?: File | string;
  national_id_passport_front?: File | string;
  national_id_passport_back?: File | string;
  vehicle_registration_front?: File | string;
  vehicle_registration_back?: File | string;
  company_commercial_registration?: File | string;
  profile_image?: File | string;
}

/**
 * Response type for updating rider
 */
export interface UpdateDeliveryRiderResponse {
  message: string;
  rider: DeliveryRider;
}

/**
 * Payload for validating rider basic information
 */
export interface ValidateRiderBasicInfoPayload {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  city: string;
  allow_password_change: boolean;
}

/**
 * Response type for validating rider basic information
 */
export interface ValidateRiderBasicInfoResponse {
  go_to_next: boolean;
}

/**
 * Payload for creating a new rider
 */
export interface CreateDeliveryRiderPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  city?: string;
  vehicle_type: string;
  driver_license_front: File;
  driver_license_back: File;
  national_id_passport_front: File;
  national_id_passport_back: File;
  vehicle_registration_front: File;
  vehicle_registration_back: File;
  company_commercial_registration?: File;
  profile_image?: File;
  model_year_limit: number;
  is_four_wheeler?: boolean;
  air_conditioning?: boolean;
  change_password_allowed?: boolean;
  bike_good_condition?: boolean;
  helmet?: boolean;
  insulated_delivery_bag: boolean;
  zone_id: string;
  licenseNumber: string;
  vehicle_name: string;
  vehicle_colour: string;
  vehicle_no: string;
  cod_limit_enabled?: boolean;
  cod_limit_amount?: number;
  cod_warning_threshold?: number;
  cod_auto_settlement_cycle?: string;
  cod_allow_online_payments_when_blocked?: boolean;
}

/**
 * Response type for creating a new rider
 */
export interface CreateDeliveryRiderResponse {
  message: string;
  rider: DeliveryRider;
}
