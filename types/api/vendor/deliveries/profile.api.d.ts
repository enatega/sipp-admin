import { VendorProfile } from "@/types/entities/vendor/deliveries/profile";

export interface GetVendorProfileParams {
    vendorId: string;
}

export interface UpdateVendorProfilePayload {
    vendorId: string;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    city?: string;
    bank_name?: string;
    account_title?: string;
    branch_code?: string;
    iban_account_no?: string;
    notes?: string;
    business_liscence_front_file?: string;
    business_liscence_back_file?: string;
    national_id_front_file?: string;
    national_id_back_file?: string;

}

export interface UpdateVendorProfileResponse {
    message: string;
    vendor_id: string;
}

export type GetVendorProfileResponse = VendorProfile;