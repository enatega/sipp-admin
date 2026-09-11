import Axios from '@/config/axios';
import {
  ApiErrorResponse,
  VendorOffsetDropdownResponse,
  VendorSubCategoryDropdownResponse,
} from '@/types';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type VendorOffsetDropdownParams = {
  vendorId?: string;
  offset: number;
  limit: number;
  search?: string;
};

type VendorSubCategoryDropdownParams = {
  vendorId?: string;
  page: number;
  limit: number;
  search?: string;
  parentId?: string;
};

const buildOffsetQuery = (
  params: VendorOffsetDropdownParams,
  includeSearch = true,
) => {
  const query = new URLSearchParams();
  query.append('offset', String(params.offset));
  query.append('limit', String(params.limit));

  if (params.vendorId) {
    query.append('vendorId', params.vendorId);
  }

  if (includeSearch && params.search) {
    query.append('search', params.search);
  }

  return query;
};

export const useGetVendorMenuTemplatesDropdown = (
  params: VendorOffsetDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      VendorOffsetDropdownResponse,
      ApiErrorResponse,
      VendorOffsetDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<VendorOffsetDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-menu-template-dropdown', params],
    queryFn: async () => {
      if (!params?.vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildOffsetQuery(params);
      const { data } = await Axios.get<VendorOffsetDropdownResponse>(
        `/apps/deliveries/chain-menus/list?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params?.vendorId,
    retry: false,
    ...options,
  });

export const useGetVendorCategoriesDropdown = (
  params: VendorOffsetDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      VendorOffsetDropdownResponse,
      ApiErrorResponse,
      VendorOffsetDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<VendorOffsetDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-category-dropdown', params],
    queryFn: async () => {
      if (!params?.vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildOffsetQuery(params);
      const { data } = await Axios.get<VendorOffsetDropdownResponse>(
        `/apps/deliveries/categories/vendor/dropdown?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params?.vendorId,
    retry: false,
    ...options,
  });

export const useGetVendorSubCategoriesDropdown = (
  params: VendorSubCategoryDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      VendorSubCategoryDropdownResponse,
      ApiErrorResponse,
      VendorSubCategoryDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<VendorSubCategoryDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-sub-category-dropdown', params],
    queryFn: async () => {
      if (!params?.vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = new URLSearchParams();
      query.append('page', String(params.page));
      query.append('limit', String(params.limit));
      query.append('vendorId', params.vendorId);

      if (params.search) {
        query.append('search', params.search);
      }

      if (params.parentId) {
        query.append('parentId', params.parentId);
      }

      const { data } = await Axios.get<VendorSubCategoryDropdownResponse>(
        `/apps/deliveries/categories/vendor/sub-categories?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params?.vendorId,
    retry: false,
    ...options,
  });

export const useGetVendorAddonsDropdown = (
  params: VendorOffsetDropdownParams | null,
  options?: Omit<
    UseQueryOptions<
      VendorOffsetDropdownResponse,
      ApiErrorResponse,
      VendorOffsetDropdownResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<VendorOffsetDropdownResponse, ApiErrorResponse>({
    queryKey: ['vendor-delivery-addon-dropdown', params],
    queryFn: async () => {
      if (!params?.vendorId) {
        throw new Error('Vendor ID is required');
      }

      const query = buildOffsetQuery(params);
      const { data } = await Axios.get<VendorOffsetDropdownResponse>(
        `/apps/deliveries/products/customization-groups/vendor/dropdown?${query.toString()}`,
      );

      return data;
    },
    enabled: !!params?.vendorId,
    retry: false,
    ...options,
  });
