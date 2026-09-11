import type { Option } from '../../../entities/store/deliveries/options';

export interface GetOptionsResponse {
  data: Option[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type GetOptionResponse = Option;

export interface GetOptionsQueryParams {
  store_id: string;
  page: number;
  limit: number;
  search?: string;
}

export interface OptionDropdownItem {
  id: string;
  title: string;
}

export interface GetOptionsDropdownParams {
  store_id: string;
  offset: number;
  limit: number;
  search?: string;
}

export interface GetOptionsDropdownResponse {
  data: OptionDropdownItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateOptionPayload {
  store_id: string;
  title: string;
  price: number;
  description: string;
  unitOfMeasure: string;
  stockQuantity: number;
}

export interface UpdateOptionPayload {
  id: string;
  title: string;
  price: number;
  description: string;
  unitOfMeasure: string;
  stockQuantity: number;
}

export type CreateOptionResponse = Option;

export type UpdateOptionResponse = Option;

export interface DeleteOptionResponse {
  message: string;
}
