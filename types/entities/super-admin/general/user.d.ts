import { Role } from '@/types/api/super-admin/general/role-and-permissions.api';
import { ShopMode } from '@/types/api/super-admin/enatega-deliveries/settings-profile.api';

export interface User {
  id: string;
  email: string;
  phone: string;
  password?: string;
  name: string;
  email_is_verified: boolean;
  phone_is_verified: boolean;
  fcm_token: string | null;
  profile: string;
  active_status: boolean;
  block_status: boolean;
  google_id: string | null;
  current_location: {
    type: 'Point';
    coordinates: [number, number];
  };
  last_login: string;
  tokenVersion: number;
  role_id: string | null;
  two_factor_enabled: boolean;
  createdAt: string;
  updatedAt: string;
  token?: string;
  must_change_pass: boolean;
  role?: Role | null;
  shopMode?: ShopMode | null;
}
