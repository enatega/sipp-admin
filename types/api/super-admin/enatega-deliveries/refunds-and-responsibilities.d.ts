
// Define the refund type as a union of string literals
type RefundType = "full" | "partial";

// Define the status as a union of string literals
type Status = "automatic" | "approved" | "rejected" | "pending";

// Define the structure for a single refund request item
interface RefundRequest {
    id: string;
    request_id: string;
    customer_name: string | null;
    customer_image: string | null;
    store_image: string | null;
    store_name: string | null;
    order_id: string;
    rider_name: string | null;
    refund_type: RefundType;
    amount: number;
    request_date: string; // ISO date string
    status: Status;
}

// Define the structure for the paginated response
interface RefundRequestsResponse {
    data: RefundRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetRefundAndResponsibilitiesQueryParams {
    search?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    modeScope?: string;
}

export interface ApproveRefundRequest {
    partial_refund: boolean;
    approved_amount?: number;
    points_per_usd: number;
    store_deduction_points: number;
    rider_deduction_points: number;
    internal_notes: string;
}
interface ApproveRefundRequestPayload {
    id: string;
    ApproveRefundRequest: ApproveRefundRequest
}
interface RejectRefundRequestPayload {
    id: string;
    internal_note: {
        internal_notes: string
    }
}

interface OrderInformation {
    order_id: string;
    payment_type: string;
    total_amount: number;
}

interface CustomerInformation {
    name: string;
    image: string;
    email: string;
    phone_number: string;
}

interface RefundRequestDetails {
    reason_for_refund: string;
    requested_amount: number;
    approved_amount: number | null;
    refund_type: RefundType;
}

interface AdminActions {
    points_per_usd: number;
    store_deduction_points: number;
    rider_deduction_points: number;
    customer_points_added: number;
    internal_notes: string;
}

interface PartiesInvolved {
    store_id: string;
    store_name: string;
    store_image: string;
    rider_id: string | null;
    rider_name: string | null;
}

interface Timeline {
    requested_at: string;
    approved_at: string | null;
    rejected_at: string | null;
}

interface RefundRequestDetailResponse {
    id: string;
    request_id: string;
    status: Status;
    order_information: OrderInformation;
    customer_information: CustomerInformation;
    refund_request_details: RefundRequestDetails;
    admin_actions: AdminActions;
    parties_involved: PartiesInvolved;
    timeline: Timeline;
}

interface RefundRequestActivityLog {
    id: string;
    refund_request_id: string;
    actor_id: string | null;
    action: string;
    payload: {
        note?: string;
        [key: string]: unknown;
    };
    created_at: string;
}

interface RefundRequestActivityLogResponse {
    data: RefundRequestActivityLog[];
}

export interface CreateRefundRequest {
    order_id: string;
    requested_amount: number;
    refund_type: RefundType;
    reason?: string;
}

export interface CreateRefundRequestResponse {
    message: string;
    data: RefundRequest;
}

export interface RefundOrderOption {
    orderId: string;
    storeName?: string;
    customerName?: string;
    amount: number;
    status: string;
}

export interface RefundableAmount {
    orderTotal: number;
    refundedOrReservedAmount: number;
    remainingRefundableAmount: number;
}
