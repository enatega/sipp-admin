import { useQuery } from '@tanstack/react-query';
import Axios from '@/config/axios';
import type { ApiErrorResponse } from '@/types';

export interface ProductFavouriteFoodOption {
  id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  isActive?: boolean;
  isDeleted?: boolean;
}

export function useProductFavouriteFoodOptions(storeId?: string) {
  return useQuery<ProductFavouriteFoodOption[], ApiErrorResponse>({
    queryKey: ['product-favourite-food-options', storeId],
    queryFn: async () => {
      const { data } = await Axios.get<ProductFavouriteFoodOption[]>(
        '/apps/deliveries/products/favourite-food-options',
        { params: { storeId } },
      );
      return data;
    },
    enabled: Boolean(storeId),
    staleTime: 60_000,
    retry: false,
  });
}
