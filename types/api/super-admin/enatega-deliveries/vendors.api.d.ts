import { Vendor } from '@/types';

export type VendorSimple = Pick<Vendor, 'id' | 'name'>;

export type GetAllVendorsSimpleResponse = VendorSimple[];

/**
 * Query parameters for fetching vendors
 */
export interface GetVendorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: string; // active, pending, approved, rejected, blocked
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  modeScope?: string;
}

/**
 * Response type for fetching vendors with pagination
 */
export interface GetDeliveryVendorsResponse {
  total: number;
  page: number;
  limit: number;
  data: Vendor[];
}

/**
 * Response type for fetching single vendor detail
 */
export interface GetVendorDetailResponse {
  id: string;
  vendorstatus: string;
  city: string | null;
  companyname: string | null;
  companydescription: string | null;
  companyofficeaddress: string | null;
  contactperson: string | null;
  industry: string | null;
  companycity: string | null;
  businesslicensefront: string | null;
  businesslicenseback: string | null;
  nationalidfront: string | null;
  nationalidback: string | null;
  name: string;
  email: string;
  phone: string;
  bankname: string | null;
  accountholdername: string | null;
  accountnumber: string | null;
  branchcode: string | null;
  zoneid: string | null;
  zonename: string | null;
}

export interface GetDeliveryVendorProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  city: string | null;
  created_date: string;
  status: string;
  active_status: boolean;
  block_status: boolean;
  national_id_front: string | null;
  national_id_back: string | null;
  business_license_front: string | null;
  business_license_back: string | null;
  bank_details: {
    bank_name: string | null;
    account_holder_name: string | null;
    account_number: string | null;
    branch_code: string | null;
  } | null;
  rating: {
    total_rating: number;
    total_reviews: number;
    average_rating: number;
  };
  total_stores: number;
}



/**
 * Payload for creating a new vendor
 */
export interface CreateVendorPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  zone_id: string;
  allow_password_change: boolean;
  sendCredentialsViaEmail: boolean;

  vendorImage?: File | null;
  business_liscence_front_file?: File | null;
  business_liscence_back_file?: File | null;
  national_id_front_file?: File | null;
  national_id_back_file?: File | null;
  business_trademark_file?: File | null;
}

/**
 * Payload for updating a vendor
 */
export interface UpdateVendorPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  zone_id?: string;
  approve_all_stores?: boolean;
  profile?: File | null;
  business_liscence_front_file?: File | null;
  business_liscence_back_file?: File | null;
  national_id_front_file?: File | null;
  national_id_back_file?: File | null;
  business_trademark_file?: File | null;
}
