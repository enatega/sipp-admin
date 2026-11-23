export type AdminProfileKey =
  | 'Admin'
  | 'Staff'
  | 'Vendor'
  | 'Store';

export interface AdminProfile {
  key: AdminProfileKey;
  data: {
    id: string;
    type?: string;
    user_profile_id?: string;
  } & Record<string, unknown>;
}
