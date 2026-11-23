import Axios from '@/config/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResponse } from '@/types';

interface CustomerTestResult { customer_id: string; is_test: boolean }

export function useUpdateMeasurementTestAccount(customerId: string, detailId: string) {
  const queryClient = useQueryClient();
  return useMutation<CustomerTestResult, ApiErrorResponse, boolean>({
    mutationFn: async (isTest) => {
      const { data } = await Axios.patch<CustomerTestResult>(
        `/user-management/${encodeURIComponent(customerId)}/measurement-test-account`,
        { is_test: isTest },
      );
      return data;
    },
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get-user-details', detailId] });
      void queryClient.invalidateQueries({ queryKey: ['get-user-management'] });
    },
  });
}
