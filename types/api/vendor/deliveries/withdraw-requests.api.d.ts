import type {
  VendorStoreBankDetail,
  VendorStoreWithdrawalRequest,
  VendorStoreWithdrawalStore,
} from '../../../entities/vendor/deliveries/withdrawal-request';

export interface GetVendorStoreWithdrawRequestsQueryParams {
  vendorId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetVendorStoreWithdrawRequestsResponse {
  data: VendorStoreWithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}


export interface RejectVendorWithdrawPayload {
  id: string;
  reason?: string;
}

export interface RejectVendorWithdrawResponse {
  success: boolean;
  message: string;
}

// types/entities/super-admin/enatega-deliveries/withdraw.ts

export interface ApproveVendorWithdrawPayload {
  id: string;
  approved_amount: number;
  file: string; // binary file
  notes?: string;
}

export interface ApproveVendorWithdrawResponse {
  message: string;
  success: boolean
  withdrawId: string
  paymentProof: string
  notes: string
  status: string

}
export interface GetVendorWithdrawRequestStore {
  store_id: string;
  store_name: string;
  store_user_id: string;
  available_funds: number;
}

export interface GetVendorWithdrawRequestStoresQueryParams {
  vendorId: string;
}

export interface GetVendorWithdrawRequestStoresResponse {
  data: VendorStoreWithdrawalStore[];
}

export interface GetVendorStoreBankDetailsQueryParams {
  vendorId: string;
  storeUserId: string;
}

export interface GetVendorStoreBankDetailsResponse {
  data?: VendorStoreBankDetail[];
  bank_details?: VendorStoreBankDetail[];
}

export interface CreateVendorStoreWithdrawRequestBody {
  store_user_id: string;
  withdrawal_amount: number;
  bank_id: string;
  additional_notes?: string;
}

export interface CreateVendorStoreWithdrawRequestResponse {
  request_id: string;
  store_user_id: string;
  withdrawal_amount: number;
  bank_id: string;
  additional_notes: string | null;
  status: string;
  date_time: string;
}
