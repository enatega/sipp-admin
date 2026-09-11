// types/entities/super-admin/vendor-profile.d.ts

export type VendorStatus = "pending" | "approved" | "rejected";

export interface VendorBankDetails {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    branch_code: string;
}

export interface VendorRating {
    total_rating: number;
    total_reviews: number;
    average_rating: number;
}

export interface VendorProfile extends Record<string, unknown> {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_image: string | null;
    city: string | null;
    created_date: string; // ISO string
    status: VendorStatus;
    active_status: boolean;
    block_status: boolean;

    national_id_front: string | null;
    national_id_back: string | null;
    business_license_front: string | null;
    business_license_back: string | null;

    bank_details: VendorBankDetails | null;
    rating: VendorRating;
    notes: string | null;
    total_stores: number;
}


