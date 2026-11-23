import type { AvailableRider } from '@/types';
import Axios from '@/config/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export interface DeliveryIssue {
  id: string; status: string; reason: string; description: string | null; createdAt: string;
  riderName: string; riderPhone: string; riderId: string; chatBoxId?: string; revision: number;
  history: Array<{ action: string; note: string; actorId: string; at: string; key?: string }>;
  allowedActions: { review: boolean; resolve: boolean; reassign: boolean; cancel: boolean };
}
export interface DeliveryIssues {
  reports: DeliveryIssue[]; orderRevision: string; assignmentVersion: number; status: string;
  refund: { amount: number; destination: string; paymentMethod: string };
}
export interface IssueAction {
  issueId: string; orderRevision: string; refundAmount: number; revision: number; assignmentVersion: number; key: string;
  action: 'review' | 'note' | 'resolve' | 'reassign' | 'cancel'; note: string; riderId?: string;
}
export function useDeliveryIssues(orderId: string) {
  const client = useQueryClient();
  const key = ['delivery-issues', orderId];
  const query = useQuery({ queryKey: key, queryFn: async () => (await Axios.get<DeliveryIssues>(`/apps/deliveries/super-admin/orders/${orderId}/delivery-issues`)).data,
    enabled: !!orderId, retry: false, staleTime: 30_000 });
  const mutation = useMutation({ mutationFn: async (body: IssueAction) => (await Axios.patch<DeliveryIssues>(
    `/apps/deliveries/super-admin/orders/${orderId}/delivery-issues/${body.action === 'reassign' ? 'reassign' : 'resolve'}`, body)).data,
    retry: false, onSuccess: (data, body) => {
      client.setQueryData(key, data);
      if (body.action !== 'note') void client.invalidateQueries({ queryKey: ['get-orders'] });
      if (body.action === 'cancel' || body.action === 'reassign') {
        void client.invalidateQueries({ queryKey: ['get-order', orderId] });
      }
    } });
  return { query, mutation };
}

export function useReplacementRiders(orderId: string, page: number, enabled: boolean) {
  return useQuery({ queryKey: ['delivery-issue-riders', orderId, page], enabled, staleTime: 30_000, retry: false,
    queryFn: async () => (await Axios.get<{ data: AvailableRider[]; hasNextPage: boolean }>(
      `/apps/deliveries/super-admin/orders/${orderId}/riders`, { params: { page, limit: 10 } })).data });
}
