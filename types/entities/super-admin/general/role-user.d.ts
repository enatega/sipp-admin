export interface RoleUser {
  admin_id: string;
  admin_type: 'admin' | 'vendor';
  profile_id: string;
  user_type_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_profile_pic: string;
  user_role: string | null;
}
