import { StoreBankDetails, StorePayoutRequest } from "@/types/entities/store/deliveries/withdrawal-request";

export interface GetStoreWithdrawRequestsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export interface GetStoreWithdrawRequestsResponse {
    data: StorePayoutRequest[] | undefined;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface CreateStoreWithdrawalRequestPayload {
    withdrawal_amount: number;
    bank_id: string;
    additional_notes?: string;
}

export interface CreateStoreWithdrawalRequestResponse {
    request_id: string;
    store_id: string;
    user_id: string;
    withdrawal_amount: number;
    bank_id: string;
    additional_notes?: string;
    status: string;
    date_time: string;
}

export interface GetStoreBankDetailsResponse {
    store_id: string;
    user_id: string;
    bank_details: StoreBankDetails[];
}