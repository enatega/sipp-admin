import { VendorStoreWithdrawalRequestStatus } from "@/types/entities/vendor/deliveries/withdrawal-request";


// Vendor Withdrawal Request Types
export type VendorWithdrawalStatus = VendorStoreWithdrawalRequestStatus;
export type VendorWithdrawalFilterStatus = VendorWithdrawalStatus | 'all';

export interface VendorWithdrawalRequest {
  requestId: string;
  storeId: string;
  name: string;
  logo?: string;
  amount: number;
  status: VendorWithdrawalStatus;
  date: string;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    branchCode?: string;
    swiftCode?: string;
  };
  notes?: string;
  paymentProof?: string;
  rejectionReason?: string;
  [key: string]: unknown;
}

export interface VendorWithdrawalFormData {
  storeId: string;
  amount: number;
  isMaximum: boolean;
  notes?: string;
}

export interface VendorBankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  branchCode?: string;
  swiftCode?: string;
}

export interface VendorStore {
  id: string;
  storeUserId?: string;
  name: string;
  availableBalance: number;
}

export interface GetVendorWithdrawalRequestsResponse {
  requests: VendorWithdrawalRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IVendorWithdrawalRequestsTable {
  requests?: VendorWithdrawalRequest[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading?: boolean;
  isError?: boolean;
  onViewDetails?: (request: VendorWithdrawalRequest) => void;
  onCreateWithdrawal?: () => void;
  onApprove?: (request: VendorWithdrawalRequest) => void;
  onReject?: (request: VendorWithdrawalRequest) => void;
}
