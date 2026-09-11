

export interface StoreWithdrawalBankDetails extends Record<string, unknown> {
    wallet_id: string;
    bank_title: string;
    bank_name: string;
    iban: string;
    account_no: string;
    branch_code: string;
}

export type PayoutStatus = "all" | "pending" | "approved" | "rejected";

export interface StorePayoutRequest extends Record<string, unknown> {
    request_id: string;
    requested_amount: number;
    request_date: string;
    status: PayoutStatus;
    bank_details: StoreWithdrawalBankDetails;
    rejection_reason: string | null;
    additional_notes: string | null;
    payment_proof: string | null;
    store_name: string;
    vendor: string;
    store_balance: number;
}

export interface StoreBankDetails extends Record<string, unknown> {
    id: string;
    bank_name: string;
    account_title: string;
    account_number: string;
    iban: string;
    currency: string;
    account_code: string;
    created_at: string;
    updated_at: string;
}