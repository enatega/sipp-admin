/**
 * Response type for GET /api/v1/apps/deliveries/admin-general-settings
 */
export interface GetAdminSettingsResponse {
  name: string;
  email: string;
  phone: string;
  two_factor_enabled: boolean;
  profile: string;
}

/**
 * Payload for PATCH /api/v1/apps/deliveries/admin-general-settings/profile
 * Sent as multipart/form-data
 */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_image?: File | null;
  two_factor_auth?: boolean;
}

/**
 * Response type for profile update
 */
export interface UpdateProfileResponse {
  message: string;
}

/**
 * Payload for POST /api/v1/apps/deliveries/admin-general-settings/change-password
 */
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Response type for password change
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Response type for POST /api/v1/apps/deliveries/admin-general-settings/two-factor
 */
export interface ToggleTwoFactorResponse {
  message: string;
  two_factor_enabled: boolean;
}

/**
 * Shop mode type
 */
export type ShopMode = "SINGLE_VENDOR" | "MULTI_VENDOR" | "STORE_CHAIN";

/**
 * Response type for GET /api/v1/apps/deliveries/admin-general-settings/shop-mode
 */
export interface GetShopModeResponse {
  shop_mode: ShopMode;
}

/**
 * Payload for PATCH /api/v1/apps/deliveries/admin-general-settings/shop-mode
 */
export interface UpdateShopModePayload {
  shop_mode: ShopMode;
}

/**
 * Response type for shop mode update
 */
export interface UpdateShopModeResponse {
  message: string;
  shop_mode: ShopMode;
}
