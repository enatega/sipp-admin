import type {
  Addon,
  AddonSelectionType,
} from '../../../entities/store/deliveries/addon';
import type { MessageResponse } from '../../common';
import type { Option } from '../../../entities/store/deliveries/options';

export interface GetAddonsQueryParams {
  store_id: string;
  page: number;
  limit: number;
  search?: string;
}

export interface GetAddonsDropdownParams {
  store_id: string;
  offset: number;
  size: number;
  search?: string;
}

export interface GetAddonsResponse {
  data: Addon[];
  total: number;
  offset: number;
  size: number;
  hasMore: boolean;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type GetAddonsDropdownResponse = GetAddonsResponse;

export interface CreateAddonPayload {
  store_id: string;
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  type: 'add-on';
  optionIds: string[];
}

export interface CreateAddonRequest {
  groups: CreateAddonPayload[];
}

export interface AddonBaseCreated {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: string | number;
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
}

export type CreateAddonResponse = AddonBaseCreated[];

export interface UpdateAddonPayload {
  id: string;
  store_id: string;
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  type: 'add-on';
  optionIds: string[];
}

export interface UpdateAddonResponse extends AddonBaseCreated {
  options: Array<{
    id: string;
    name: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    option: Option;
  }>;
}

export type DeleteAddonResponse = MessageResponse;
