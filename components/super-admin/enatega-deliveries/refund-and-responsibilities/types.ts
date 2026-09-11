
export type RefundRequestStatus = 'pending' | 'approved' | 'rejected';

export type RefundType = 'full' | 'partial';

export interface RefundOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface RefundActivityLog {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
}

export interface RefundRequestRecord {
  id: string;
  requestId: string;
  orderId: string;
  customerName: string;
  customerAvatar: string;
  customerEmail: string;
  customerPhone: string;
  storeName: string;
  storeAvatar: string;
  riderName: string;
  riderAvatar: string;
  refundType: RefundType;
  amountUsd: number;
  requestDate: string;
  status: RefundRequestStatus;
  paymentType: string;
  reason: string;
  items: RefundOrderItem[];
  activityLogs: RefundActivityLog[];
}


