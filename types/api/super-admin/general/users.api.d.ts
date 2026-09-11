import { AccountStatus, RegistrationMethod, UMUserDetails, UserManagementItem } from "../../entities/user-management";


export interface GetUserManagementQueryParams {
  page?: number;
  limit?: number;
  RegistrationMethod?: RegistrationMethod[];
  AccountStatus?: AccountStatus[];
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GetUserManagementResponse {
  page: number;
  data: UserManagementItem[];
  total: number;
  limit: number;
}

export interface UpdateInternalNotePayload {
  userId: string;
  internalNote: string;
}

export interface UpdateInternalNoteResponse {
  message: string;
}

export type ForceLogoutResponse = {
  message: string;
};


export type BlockUnblockUserPayload = {
  userId: string;
  reason: string;
};

export type DeactivateUserPayload = {
  userId: string;
  reason: string;
};


export interface GetUMUserDetailsResponse {
  message: string;
  user: UMUserDetails;
}

export interface UserOrderItem {
  rideId: string;
  rideDate: string;
  amount: string;
  status: string;
  type: string;
  app?: string;
}

export interface GetUserOrdersResponse {
  data: UserOrderItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UserHistoryApiItem {
  orderId: string;
  status: string;
  app: string;
  orderType: string;
  amount: string;
  createdAt: string;
}

export type GetUserHistoryResponse = UserHistoryApiItem[];

export interface UserReviewItemReviewed {
  id: string;
  name: string;
  profile: string;
}

export interface UserReviewItemRide {
  id: string;
  status: string;
  agreed_price: string;
  completedAt: string;
}

export interface UserReviewItem {
  id: string;
  description: string;
  rating: number;
  ride_id: string;
  reviewer?: UserReviewItemReviewed;
  reviewed?: UserReviewItemReviewed;
  ride: UserReviewItemRide;
  createdAt: string;
}



export interface GetUserReviewsResponse {
  type: 'given' | 'received';
  page: number;
  limit: number;
  givenCount: number;
  receivedCount: number;
  given: UserReviewItem[];
  received: UserReviewItem[];
}

export interface UserAddressItem {
  id: string;
  user_id: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserAddressesResponse {
  success: boolean;
  message: string;
  data: UserAddressItem[];
}

export interface AuditLogUser {
  id: string;
  email: string | null;
  phone: string | null;
  password: string | null;
  name: string;
  email_is_verified: boolean;
  phone_is_verified: boolean;
  fcm_token: string | null;
  profile: string;
  active_status: boolean;
  block_status: boolean;
  google_id: string | null;
  current_location: string | null;
  last_login: string;
  tokenVersion: number;
  role_id: string | null;
  two_factor_enabled: boolean;
  internal_notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  oldValue: Record<string, JSON>;
  newValue: Record<string, JSON>;
  entity: string;
  entityId: string;
  userId: string;
  createdAt: string;
  user: AuditLogUser;
}

export interface GetUserAuditLogsResponse {
  message: string;
  userId: string;
  count: number;
  data: AuditLog[];
}
