import {
  Priority,
  Status,
  TicketType,
} from '@/types/entities/super-admin/general/customer-support';
export type SupportModule = 'deliveries';
export interface GetCustomerSupportResponse {
  total: number;
  offset: number;
  limit: number;
  count: number;
  data: CustomerSupportTicketItem[];
}



export interface CustomerSupportGroupedTickets {
  today: CustomerSupportGroupedByCustomer[];
  yesterday: CustomerSupportGroupedByCustomer[];
  older: CustomerSupportGroupedByCustomer[];
}

export interface CustomerSupportTicketItem {
  id: string;
  ticketId: string | null;
  title: string;
  status: string;
  priority: string;
  ticketType: string;
  latestMessage: string;
  latestMessageAt: string;
  createdAt: string;
  sender: CustomerSupportSenderInfo;
  totalMessages: number;
  unreadCount: number;
}

export interface CustomerSupportGroupedByCustomer extends CustomerSupportTicketItem {
  ticketCount: number;
  unreadCount: number;
}

export interface CustomerSupportSenderInfo {
  id: string;
  name: string;
  profile: string;
}

export interface GetCustomerSupportQueryParams {
  offset?: number;
  limit?: number;
  ticketType?: TicketType[];
  status?: Status;
  priority?: Priority;
  search?: string;
  from?: string;
  to?: string
}

export type GetCustomerSupportUserTicketByIdResponse =
  GetCustomerSupportUserTicketByIdResponseItem[];

export interface GetCustomerSupportUserTicketByIdResponseItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  latestMessage: string;
  tickettype: string;
  latestMessageAt: string;
  sender: GetCustomerSupportUserTicketByIdResponseItemSender;
}

export interface GetCustomerSupportUserTicketByIdResponseItemSender {
  id: string;
  name: string;
  profile: string;
}

// GetCustomerSupportTicketMessagesById
export interface GetCustomerSupportTicketMessagesByIdResponse {
  message: string;
  status: string;
  chatBoxId: string;
  derivedFrom: string;
  chatBoxTitle: string;
  sender: Sender;
  auditLogs: AuditLogs;
  reviews: Reviews;
  totalMessages: number;
  messages: Message[];
}

export interface Sender {
  id: string
  email: string | null
  phone: string
  name: string
  profile: string
  active_status: boolean
  block_status: boolean
  google_id: string | null
  last_login: string
  createdAt: string
  updatedAt: string
}

export interface AuditLogs {
  message: string
  userId: string
  count: number
  data: AuditLog[]
}

export interface AuditLog {
  entity: string
  status: string
  comment: string
  entityId: string
  userId: string
  createdAt: string
}

export interface Reviews {
  totalReceived: number
  averageRating: number
}

export interface Message {
  id?: string
  sender_id: string
  receiver_id: string
  text: string
  chat_box_id?: string
  createdAt?: string
  updatedAt?: string
}
// GetCustomerSupportTicketMessagesById End

export interface SupportChatSendMessagePayload {
  chatBoxId: string;
  text: string;
}

export type SupportChatSendMessageResponse = {
  message: string;
  chatBoxId: string;
  detail: Message
};

// update ticket status start
export interface UpdateTicketStatusPayload {
  chatBoxId: string
  status: string
  notes: string
}
export interface UpdateTicketStatusResponse {
  message: string
  data: UpdateTicketStatusData
}

export interface UpdateTicketStatusData {
  id: string
  status: string
  notes: string
  updatedAt: string
}
// update ticket status end
