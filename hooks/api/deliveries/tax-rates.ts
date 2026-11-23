import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StoreTaxAssignmentsResponse, TaxRate, TaxScope } from '@/types/tax';
import Axios from '@/config/axios';

export function useTaxRates(scope: TaxScope, admin = false) {
  return useQuery({
    queryKey: ['tax-rates', scope, admin],
    queryFn: async () =>
      (
        await Axios.get<TaxRate[]>(
          `/apps/deliveries/${admin ? 'admin/' : ''}tax-rates`,
          { params: { scope } },
        )
      ).data,
  });
}

export function useTaxRateMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      remove,
      values,
    }: {
      id?: string;
      remove?: boolean;
      values?: Partial<Omit<TaxRate, 'id'>>;
    }) => {
      const path = `/apps/deliveries/admin/tax-rates${id ? `/${id}` : ''}`;
      if (remove) return (await Axios.delete(path)).data;
      if (id) return (await Axios.patch(path, values)).data;
      return (await Axios.post(path, values)).data;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['tax-rates'] });
      await client.invalidateQueries({ queryKey: ['get-store-detail'] });
    },
  });
}

export function useTaxStoreAssignments(params: {
  scope: TaxScope;
  page: number;
  limit: number;
  search?: string;
  taxRateId?: string;
}) {
  return useQuery({
    queryKey: ['tax-rate-store-assignments', params],
    queryFn: async () =>
      (
        await Axios.get<StoreTaxAssignmentsResponse>(
          '/apps/deliveries/admin/tax-rates/stores',
          { params },
        )
      ).data,
  });
}

export function useStoreTaxAssignmentMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storeId,
      scope,
      taxRateId,
    }: {
      storeId: string;
      scope: TaxScope;
      taxRateId: string;
    }) =>
      (
        await Axios.patch(
          `/apps/deliveries/admin/tax-rates/stores/${storeId}`,
          { scope, taxRateId },
        )
      ).data,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['tax-rate-store-assignments'] }),
        client.invalidateQueries({ queryKey: ['get-store-detail'] }),
        client.invalidateQueries({ queryKey: ['store-profile'] }),
      ]);
    },
  });
}
