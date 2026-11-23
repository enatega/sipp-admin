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


export interface NotificationSendStats {
  sentAt?: string;
  successCount: number;
  failureCount: number;
  totalTargetUsers: number;
  errors?: string[];
  breakdown?: SendNotificationBreakdown[];
}

export interface NotificationReceiptStats {
  expected: number;
  delivered: number;
  failed: number;
  /** Failure counts by short reason, e.g. `BadDeviceToken`. */
  reasons?: Record<string, number>;
}

export interface NotificationMetadata extends Record<string, unknown> {
  sendStats?: NotificationSendStats;
  receiptStats?: NotificationReceiptStats;
  targetUserIds?: string[];
}

/** The stored notification, read back to follow delivery after a send. */
export interface NotificationRecord {
  id: string;
  metadata?: NotificationMetadata;
}

export interface GetNotification extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  type: UserType[];
  metadata?: NotificationMetadata;
  image_url?: string;
  deep_link?: string;
  data?: Record<string, unknown>;
  zone_ids?: string[];
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
  /** Groups to notify; at least one of userTypes or userIds is required. */
  userTypes?: UserType[];
  image_url?: string;
  deep_link?: string;
  data?: Record<string, unknown>;
  /** Narrows every selected group to these zones. */
  zoneIds?: string[];
  /** Individual users to notify on top of the groups. */
  userIds?: string[];
}

export interface AudiencePreviewPayload {
  userTypes?: UserType[];
  zoneIds?: string[];
  userIds?: string[];
}

export interface AudiencePreviewGroup {
  userType: string;
  total: number;
  pushEnabled: number;
}

export interface AudiencePreview {
  /** Per-group reach of the selected audience. */
  groups: AudiencePreviewGroup[];
  /** Distinct people matched, and how many of them can receive a push (devices). */
  total: number;
  pushEnabled: number;
  /** All four groups under the current zone filter, for the group cards. */
  catalog: AudiencePreviewGroup[];
  /** Same audience with the zone filter removed; present only when zones are set. */
  unfiltered?: { total: number; pushEnabled: number };
  /** Who is matched; present only when the audience is small enough to list. */
  recipients?: AudienceUser[];
}

export interface AudienceUser {
  id: string;
  name: string | null;
  email: string | null;
  userTypes: string[];
  hasPush: boolean;
}

export interface SendNotificationBreakdown {
  userType: string;
  targets: number;
  accepted: number;
  failed: number;
}

export interface SendNotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  totalTargetUsers: number;
  notificationId: string;
  errors?: unknown[];
  breakdown?: SendNotificationBreakdown[];
}

/** Resends are queued; the server answers with the job id, not delivery counts. */
export interface ResendNotificationResponse extends Partial<SendNotificationResponse> {
  jobId?: string;
}

export interface DeleteNotificationResponse {
  message: string;
}
