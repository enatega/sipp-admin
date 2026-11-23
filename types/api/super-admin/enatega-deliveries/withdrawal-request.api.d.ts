import { RiderWithdrawalRequest, StoreWithdrawalRequest, VendorWithdrawalRequest } from "@/entities/super-admin/enatega-deliveries/withdrawal-request/withdrawal-request";

export interface GetwithdrawalRequestsQueryParams {
    paymentMethod?: string;
    withdrawType?: string;
    shopType?: string;
    endDate?: string;
    startDate?: string;
    zoneId?: string;
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
    modeScope?: string;
}

export interface LumiFoodPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export type LumiFoodWithdrawalRequest =
    | VendorWithdrawalRequest
    | RiderWithdrawalRequest
    | StoreWithdrawalRequest;

export type GetLumiFoodWithdrawalRequestsResponse = LumiFoodPaginatedResponse<LumiFoodWithdrawalRequest>;


export interface ApproveWithdrawalRequestParams {
    id: string,
    approved_amount: number,
    notes?: string,
    file: File | null
}

export interface ApproveLumiFoodWithdrawalRequestResponse {
    success: boolean,
    message: string,
    withdrawId: string
    approveAmount: number
    paymentMethod: string
    notes: string | null
    status: "APPROVED" | "TRANSFERRED"
}

export interface RejectWithdrawalRequestParams {
    id: string,
    reason: string,
}

export interface RejectLumiFoodWithdrawalRequestResponse {
    success: boolean,
    message: string,
    withdrawId: string
    rejectionReason: string
}
