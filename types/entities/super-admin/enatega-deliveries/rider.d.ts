
export interface Rider extends Record<string, unknown> {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  vehicle_type: string;
  total_deliveries: number;
  total_earnings: number;
  registration_date: string;
  ratings: number;
  status: string;
  rejectionReason: string | null;
  VehicleBrand: string;
  modelYear: number;
  vehicleColor: string;
  VehicleNumber?: string;
  createdAt: string;
}

/**
 * Delivery Rider entity matching API response structure
 */
export interface DeliveryRider extends Record<string, unknown> {
  id: string;
  earned_points: number;
  referral_code: string | null;
  vehicle_id: string;
  licenseNumber: string;
  zoneId: string;
  city: string | null;
  availabilityStatus: string;
  user_profile_id: string;
  linked_store_id: string | null;
  linked_admin_id: string | null;
  is_approved: boolean;
  rejection_reason: string;
  fcm_token: string | null;
  status: 'pending' | 'approved' | 'rejected' | string;
  is_onboarding_completed: boolean;
  driver_license_front: string;
  driver_license_back: string;
  national_id_passport_front: string;
  national_id_passport_back: string;
  vehicle_registration_front: string;
  vehicle_registration_back: string;
  terms_conditions_viewed: boolean;
  weekly_shifts: {
    friday: Array<{ end: string; start: string }>;
    monday: Array<{ end: string; start: string }>;
    sunday: Array<{ end: string; start: string }>;
    tuesday: Array<{ end: string; start: string }>;
    saturday: Array<{ end: string; start: string }>;
    thursday: Array<{ end: string; start: string }>;
    wednesday: Array<{ end: string; start: string }>;
  };
  created_at: string;
  updated_at: string;
  change_password_allowed: boolean;
  air_conditioning?: boolean;
  helmet?: boolean;
  cod_limit_enabled?: boolean;
  cod_limit_amount?: number;
  cod_warning_threshold?: number;
  cod_auto_settlement_cycle?: string;
  cod_allow_online_payments_when_blocked?: boolean;
  deliveryEarningPercentage?: number;
  cod_limit_settings?: {
    enabled?: boolean;
    amount?: number;
    warning_threshold?: number;
    auto_settlement_cycle?: string;
    allow_online_payments_when_blocked?: boolean;
  };
  zone: {
    id: string;
    title: string;
    description: string;
    zoneShape: string;
    zonePolygon: {
      type: string;
      coordinates: number[][][][];
    };
    circleData: unknown;
    zoneType: string[];
    createdAt: string;
  };
  userProfile: {
    id: string;
    createdAt: string;
    updatedAt: string;
    user_type_id: string;
    user_id: string;
    user: {
      id: string;
      email: string;
      phone: string;
      password: string | null;
      name: string;
      email_is_verified: boolean;
      phone_is_verified: boolean;
      fcm_token: string | null;
      profile: string;
      active_status: boolean;
      block_status: boolean;
      google_id: string | null;
      current_location: unknown;
      last_login: string | null;
      tokenVersion: number;
      role_id: string | null;
      two_factor_enabled: boolean;
      internal_notes: string;
      must_change_pass: boolean;
      termsAccepted: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  vehicle?: {
    id: string;
    vehicle_type: string | null;
    rider_id: string;
    model_year: number;
    vehicle_name: string;
    vehicle_colour: string;
    vehicle_no: string;
    is_four_wheeler: boolean;
    air_conditioning: boolean;
    no_cosmetic_damage: boolean;
    bike_good_condition: boolean;
    helmet: boolean;
    insulated_delivery_bag: boolean;
    vehicleType?: {
      id: string;
      name: string;
    };
    created_at: string;
    updated_at: string;
  };
  totalDeliveries?: number;
  totalEarnings?: number;
  averageRating?: number;
}
