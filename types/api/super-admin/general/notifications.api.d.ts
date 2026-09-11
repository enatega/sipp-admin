export type UserType = 'all' | 'rider' | 'customer' | 'store' | 'admin' | 'staff' | 'vendor';
export type SortByField = 'title' | 'created_at' | 'type';
export type SortOrder = 'ASC' | 'DESC';

export interface Notification {
  id: string;
  title: string;
  description: string;
  userTypes: UserType[];
  image_url?: string;
  deep_link?: string;
  data?: Record<string, unknown>;
  zoneIds?: string[];
  createdAt: string;
  updatedAt: string;
  type?: string;
}

export interface GetNotificationsQueryParams {
  sentTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
  limit?: number;
  page?: number;
  offset?: number;
}


export interface GetNotification extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  type: UserType[];
  image_url?: string;
  deep_link?: string;
  data?: Record<string, unknown>;
  zoneNames?: string[];
  created_at: string;
}

export interface GetNotificationsResponse {
  notifications: GetNotification[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetNotificationByIdResponse extends Notification { }

export interface SendNotificationPayload {
  title: string;
  description: string;
  userTypes: UserType[];
  image_url?: string;
  deep_link?: string;
  data?: Record<string, unknown>;
  zoneIds?: string[];
}

export interface SendNotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  totalTargetUsers: number;
  notificationId: string;
  errors?: unknown[];
}

export interface ResendNotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  totalTargetUsers: number;
  notificationId: string;
  errors?: unknown[];
}

export interface DeleteNotificationResponse {
  message: string;
}
