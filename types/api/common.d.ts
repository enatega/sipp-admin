
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[]
      data?: {
        message?: string | string[]
      }
    }
  }
  message?: string | string[]
  statusCode?: number
  code?: string
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  data?: T[];
  page?: number;
  pages?: number;
  docsCount?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ItemDetailResponse<T> {
  doc: T
}

export interface AffectedRowsResponse {
  raw: unknown[];
  affected: number;
}

export type MessageResponse = {
  message: string;
};
