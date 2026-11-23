import { ShopType } from '@/types';

export interface ShopTypeFormValues {
  name: string;
  image: string | File | null;
  description: string;
  is_active: boolean;
}

export interface EditShopTypeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shopTypeData: ShopType;
}

export interface EditShopTypeFormProps {
  onClose: () => void;
  shopTypeData: ShopType;
}
