import { DeliveryShopType, ShopType } from "@/types";

export type GetAllShopTypesSimpleResponse = DeliveryShopType[];

/**
 * Query parameters for fetching shop types
 */
export interface GetShopTypesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    businessType?: string;
    status?: string;
}

/**
 * Response type for fetching shop types with pagination
 */
export interface GetShopTypesResponse {
    data: ShopType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Response type for deleting a shop type
 */
export interface DeleteShopTypeResponse {
    message: string;
}

export interface PostShopTypePayload {
    name: string;
    image?: File;
    description?: string;
    is_active: boolean;
}

export interface PostShopTypeResponse {
    success: boolean;
    message: string;
    data?: ShopType;
}

export interface PutShopTypePayload {
    shopTypeId: string;
    name: string;
    image?: File | string;
    description?: string;
    is_active: boolean;
}

export interface PutShopTypeResponse {
    success: boolean;
    message: string;
    data?: ShopType;
}
