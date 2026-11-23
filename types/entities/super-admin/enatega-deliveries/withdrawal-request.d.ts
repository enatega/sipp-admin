export interface BankDetails {
    wallet_id: string;
    bank_title: string;
    bank_name: string;
    iban: string;
    account_no: string;
    branch_code: string;
}

export interface BaseWithdrawalRequest {
    request_id: string;
    requested_amount: number;
    request_date: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "TRANSFERED";
    bank_details: BankDetails;
    rejection_reason: string | null;
    additional_notes: string | null;
    payment_proof: string | null;
}

export interface RiderWithdrawalRequest extends BaseWithdrawalRequest {
    rider_name: string;
    zone_name: string;
    rider_balance: number;
}

export interface StoreWithdrawalRequest extends BaseWithdrawalRequest {
    store_name: string;
    vendor: string;
    store_balance: number;
}

export interface VendorWithdrawalRequest extends BaseWithdrawalRequest {
    vendor_name: string;
    total_vendor_balance: number;
}

export interface basewithdrawalRequestById {

    withdrawalId: string;
    email: string;
    zone: string;
    amount: number;
    approveAmount: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "TRANSFERED";
    paymentProof: string;
    notes: string | null;
    dateTime: string;
    updatedAt: string;
    bankDetails: BankDetails;
}


export interface PayrollStatItem {
    count?: number;
    amount?: number;
    percentage_change: number;
}

export interface AdminPayrollStats extends Record<string, unknown> {
    total_employees: {
        count: number;
        percentage_change: number;
    };

    payroll_this_month: {
        amount: number;
        percentage_change: number;
    };

    paid_count: {
        count: number;
        percentage_change: number;
    };

    pending_count: {
        count: number;
        percentage_change: number;
    };
}

export interface AdminPayrollRequest {
    id: string;
    employee_name: string;
    role: string;
    zone_name: string;
    salary: number;
    month: string;
    status: "paid" | "unpaid";
    paid_on: string | null;
}

export interface PayrollEmployee {
    id: string;
    name: string;
    role: string;
}

export interface PayrollJobDetails {
    commission_percent: number;
    completed_jobs: number;
    available_balance: number;
    salary: number;
    overtime: number;
    deductions: number;
    net_payable: number;
}

export type PaymentStatus = 'paid' | 'unpaid';

export interface PayrollPaymentInfo {
    payment_method: string;
    transaction_id: string;
    paid_on: string;
    payment_status: PaymentStatus;
    account_number: string;
    notes: string;
    payment_proof: string;
}

export interface PayrollDetail extends Record<string, unknown> {
    id: string;
    employee: PayrollEmployee;
    job_details: PayrollJobDetails;
    payment_info: PayrollPaymentInfo;
}