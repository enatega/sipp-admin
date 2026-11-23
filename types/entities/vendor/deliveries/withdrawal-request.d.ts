export type VendorStoreWithdrawalRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'all';

export interface VendorStoreWithdrawalBankDetails {
  bank_id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string | null;
  currency: string;
  account_code: string;
}

export interface VendorStoreWithdrawalRequest {
  request_id: string;
  store_name: string;
  amount: number;
  status: VendorStoreWithdrawalRequestStatus;
  date_time: string;
  payment_proof: string | null;
  notes: string | null;
  bank_details: VendorStoreWithdrawalBankDetails;
}

export interface VendorStoreWithdrawalStore {
  store_id: string;
  store_name: string;
  store_user_id: string;
  available_funds: number;
}

export interface VendorStoreBankDetail {
  bank_id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string | null;
  currency: string;
  account_code: string;
  created_at: string;
  updated_at: string;
}
