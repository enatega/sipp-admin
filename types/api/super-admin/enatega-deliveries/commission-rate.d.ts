export interface CommissionRateResponse {
  id: string;
  commission_rate: string;
  currency: string;
}

export interface UpdateCommissionRatePayload {
  commission_percentage: number;
}

export interface UpdateCommissionRateResponse {
  commission_percentage: number;
}

export interface StoreCommissionRateItemResponse {
  store_id: string;
  store_name: string;
  vendor_name: string;
  zone_name: string;
  default_commission: string;
  status: string;
}

export interface GetStoreCommissionRatesResponse {
  data: StoreCommissionRateItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetStoreCommissionRatesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  modeScope?: string;
}

export interface ZoneCommissionRateItemResponse {
  zone_id: string;
  zone_name: string;
  commission_rate: string;
  status: string;
}

export interface GetZoneCommissionRatesResponse {
  data: ZoneCommissionRateItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetZoneCommissionRatesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateZoneCommissionRatePayload {
  commission_rate: number;
  status: 'active' | 'deactive';
}

export interface UpdateZoneCommissionRateResponse {
  zone_id: string;
  commission_rate: number;
  status: string;
}


export interface UpdateStoreCommissionRatePayload {
  commission_rate: number;
  status: 'active' | 'deactive';
}

export interface UpdateStoreCommissionRateResponse {
  store_id: string;
  commission_rate: number;
  status: string;
}
