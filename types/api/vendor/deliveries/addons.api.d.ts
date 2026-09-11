import type { MessageResponse } from '../../common';
import type {
  AddonSelectionType,
} from '../../../entities/store/deliveries/addon';
import type { Option } from '../../../entities/store/deliveries/options';

export interface VendorAddon extends Record<string, unknown> {
  id: string;
  vendor_id?: string;
  name: string;
  description: string | null;
  price: number | string;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  imageUrl: string | null;
  type: 'add-on';
  dependsOnVariationId: string | null;
  createdAt: string;
  updatedAt: string;
  options: Option[];
}

export interface VendorAddonListParams {
  vendor_id?: string;
  page: number;
  limit: number;
  search?: string;
}

export interface VendorAddonDetailParams {
  id: string;
  vendor_id?: string;
}

export interface VendorAddonListResponse extends Record<string, unknown> {
  data: VendorAddon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  hasMore?: boolean;
  offset?: number;
  size?: number;
}

export type VendorAddonDropdownResponse = VendorAddonListResponse;

export interface VendorAddonCreatePayload extends Record<string, unknown> {
  vendor_id?: string;
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  price: number;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  type: 'add-on';
  dependsOnVariationId: string | null;
  optionIds: string[];
}

export interface VendorAddonUpdatePayload extends Record<string, unknown> {
  id: string;
  vendor_id?: string;
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  price: number;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  type: 'add-on';
  dependsOnVariationId: string | null;
  optionIds: string[];
}

export type VendorAddonMutationResponse = VendorAddon;
export type VendorAddonDeleteResponse = MessageResponse;
