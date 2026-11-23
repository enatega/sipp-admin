import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from '@/config/axios';

export type DeliveryLanguage = {
  code: string;
  name: string;
  countryName: string;
  countryCode: string;
  imageUrl: string;
  isRtl: boolean;
  isActive?: boolean;
  isDefault?: boolean;
};

export function useActiveDeliveryLanguages() {
  return useQuery({
    queryKey: ['delivery-languages', 'active'],
    queryFn: async () =>
      (await Axios.get<DeliveryLanguage[]>('/apps/deliveries/languages')).data,
    staleTime: 60_000,
  });
}

export function useAdminDeliveryLanguages() {
  return useQuery({
    queryKey: ['delivery-languages', 'admin'],
    queryFn: async () =>
      (await Axios.get<DeliveryLanguage[]>('/apps/deliveries/admin/languages'))
        .data,
  });
}

export function useUpdateDeliveryLanguageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      isActive,
    }: {
      code: string;
      isActive: boolean;
    }) =>
      (
        await Axios.patch<DeliveryLanguage>(
          `/apps/deliveries/admin/languages/${code}`,
          { isActive },
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['delivery-languages'],
      });
    },
  });
}
