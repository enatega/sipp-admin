import type { Option } from './options';

export type AddonSelectionType = 'single' | 'multi';

export type AddonType = 'add-on';

export interface Addon extends Record<string, unknown> {
  id: string;
  store_id: string;
  vendor_id?: string;
  name: string;
  description: string | null;
  price: string | number;
  minSelect: number;
  maxSelect: number;
  status: boolean;
  requiredCheck: boolean;
  selectionType: AddonSelectionType;
  imageUrl: string | null;
  type: AddonType;
  dependsOnVariationId: string | null;
  createdAt: string;
  updatedAt: string;
  options: Option[];
}

export interface AddonFormValues {
  name: string;
  description: string;
  requiredCheck: boolean;
  selectionType: AddonSelectionType | '';
  optionIds: string[];
  price?: string;
  minSelect?: string;
  maxSelect?: string;
  status?: boolean;
  dependsOnVariationId?: string;
}
