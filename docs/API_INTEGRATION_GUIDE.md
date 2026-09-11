# API Integration Guide

This guide provides a comprehensive walkthrough for integrating APIs in the Lumi Admin application, based on patterns used in **Driver Management** and **Zones** modules.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Creating Types and Entities](#creating-types-and-entities)
3. [Creating API Hooks](#creating-api-hooks)
4. [Integrating API Hooks in Components](#integrating-api-hooks-in-components)
5. [Managing Loading States](#managing-loading-states)
6. [Error Handling](#error-handling)
7. [Complete Example](#complete-example)

---

## Project Structure

The API integration follows this structure:

```
lumi-admin-main/
├── types/
│   ├── entities/
│   │   └── super-admin/
│   │       ├── zones.d.ts           # Entity types
│   │       └── rider.d.ts           # Entity types
│   └── api/
│       └── super-admin/
│           └── general/
│               └── zones.api.d.ts   # API request/response types
├── hooks/
│   └── api/
│       └── super-admin/
│           ├── general/
│           │   └── zones.ts         # API hooks
│           └── enatega-drive/
│               └── driver-management.ts
├── config/
│   └── axios.ts                     # Axios configuration
└── lib/
    └── toast-error.ts               # Error handling utilities
```

---

## Creating Types and Entities

### Step 1: Define Entity Types

Create entity types in `types/entities/super-admin/`:

**File:** `types/entities/super-admin/your-module.d.ts`

```typescript
// types/entities/super-admin/your-module.d.ts

// Example: Zone types from zones.d.ts
export type ZoneType = 'food' | 'drive' | 'hotel' | 'ticket';

export type TZoneShapes = 'Point' | 'LineString' | 'Polygon' | 'Circle';

// Base entity interface
export interface Zone extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  zoneType: ZoneType[];
  createdAt: string;
  zoneShape: TZoneShapes;
  zonePolygon: ZoneGeoJsonPolygon | null;
  circleData: CustomCircle | null;
}

// Another example: Rider entity
export interface Rider extends Record<string, unknown> {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  userProfile: {
    user: {
      name: string;
      phone: string;
      email: string;
    };
  };
  rideType: {
    name: string;
  };
  comment?: string;
}
```

### Step 2: Define API Request/Response Types

Create API types in `types/api/super-admin/`:

**File:** `types/api/super-admin/your-module.api.d.ts`

```typescript
// types/api/super-admin/your-module.api.d.ts

import {
  TZoneShapes,
  Zone,
  ZoneType,
} from '@/types/entities/super-admin/your-module';

// GET request query parameters
export interface GetZonesQueryParams {
  offset?: number;
  page?: number;
  limit?: number;
  zoneType?: ZoneType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// GET request response
export interface GetZonesResponse {
  zones: Zone[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// POST request payload
export interface PostZonePayload {
  title: string;
  description: string;
  zoneType: ZoneType[];
  zoneShape: TZoneShapes;
  shape?: {
    type: TZoneShapes;
    coordinates?: ZoneGeoJsonPolygon | null;
    center?: { lat: number; lng: number } | null;
    radius?: number | null;
  } | null;
}

// POST request response
export type PostZoneResponse = Zone;

// PUT request payload
export interface PutZonePayload {
  id: string;
  title: string;
  description: string;
  zoneType: ZoneType[];
  zoneShape: TZoneShapes;
  zonePolygon?: {
    type: TZoneShapes;
    coordinates: ZoneGeoJsonPolygon;
  } | null;
  circleData?: CustomCircle | null;
}

// DELETE request response
export interface DeleteZoneResponse {
  message: string;
}
```

### Step 3: Common API Types

The common types are defined in `types/api/common.d.ts`:

```typescript
// types/api/common.d.ts

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
      data?: {
        message?: string | string[];
      };
    };
  };
  message?: string | string[];
  statusCode?: number;
  code?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data?: T[];
  page?: number;
  pages?: number;
  docsCount?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
}

export type MessageResponse = {
  message: string;
};
```

---

## Creating API Hooks

### Step 1: Understand the Axios Configuration

The app uses a pre-configured Axios instance with interceptors:

**File:** `config/axios.ts`

```typescript
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getUser, removeUser } from '@/lib/user';

const baseURL = process.env.NEXT_PUBLIC_API_URL as string;

const Axios: AxiosInstance = axios.create({
  baseURL: `${baseURL}`,
  timeout: 20000,
});

// Request interceptor - adds auth token
Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!navigator.onLine) {
      throw new Error('No internet connection.');
    }

    const user = getUser();
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  },
);

// Response interceptor - handles 401 errors
Axios.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<never> => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !isRedirecting
    ) {
      isRedirecting = true;
      removeUser();
      const next =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      window.location.replace(`/login?next=${encodeURIComponent(next)}`);
    }
    return Promise.reject(error);
  },
);

export default Axios;
```

### Step 2: Create Custom Query Hook (Optional)

For paginated/list APIs with query params, use the `useApiQuery` helper:

**File:** `hooks/api/use-api-query.ts`

```typescript
'use client';

import { ApiErrorResponse } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiErrorResponse>,
  'queryKey' | 'queryFn'
>;

type ParamTransform = {
  allowedKeys?: string[]; // Only include these keys
  omitValues?: unknown[]; // Omit params with these values
  mapper?: (params: Record<string, unknown>) => Record<string, unknown>; // Custom transform
};

export function useApiQuery<T>(
  endpoint: string,
  options?: UseApiQueryOptions<T>,
  paramTransform?: ParamTransform,
) {
  const { getAllParams } = useQueryParams();

  let params = getAllParams();

  // Apply parameter transformation
  if (paramTransform?.mapper) {
    params = paramTransform.mapper(params) as Record<string, string | string[]>;
  } else if (paramTransform?.allowedKeys) {
    params = Object.fromEntries(
      Object.entries(params).filter(([k]) =>
        paramTransform.allowedKeys!.includes(k),
      ),
    ) as Record<string, string | string[]>;
  }

  const omitSet = new Set(paramTransform?.omitValues ?? []);
  const queryKey = [endpoint, params];

  return useQuery<T, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null && v !== '' && !omitSet.has(v)) {
              query.append(key, String(v));
            }
          });
        } else {
          if (!omitSet.has(value)) {
            query.append(key, String(value));
          }
        }
      });

      const qs = query.toString();
      const apiUrl = qs ? `${endpoint}?${qs}` : endpoint;

      const res = await Axios.get<T>(apiUrl);
      return res.data;
    },
    retry: false,
    ...options,
  });
}
```

### Step 3: Create API Hooks File

**File:** `hooks/api/super-admin/your-module.ts`

```typescript
// hooks/api/super-admin/your-module.ts

import {
  ApiErrorResponse,
  DeleteZoneResponse,
  GetZonesQueryParams,
  GetZonesResponse,
  PostZonePayload,
  PostZoneResponse,
  PutZonePayload,
  Zone,
  ZoneType,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';

// ==================== GET Queries ====================

/**
 * Hook to fetch paginated zones
 * @param options - React Query options
 */
export const useGetZones = (
  options?: Omit<
    UseQueryOptions<
      GetZonesResponse,
      ApiErrorResponse,
      GetZonesResponse,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const offset = (page - 1) * limit;
  const zoneType = getParam('zoneType') as ZoneType | undefined;
  const search = getParam('search') || undefined;
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;

  const params: GetZonesQueryParams = {
    page,
    limit,
    offset,
    zoneType,
    search,
    startDate,
    endDate,
  };

  const queryKey = ['get-paginated-zones', params];

  return useQuery<GetZonesResponse, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.offset !== undefined)
        query.append('offset', String(params.offset));
      if (params.page !== undefined) query.append('page', String(params.page));
      if (params.limit !== undefined)
        query.append('limit', String(params.limit));
      if (params.zoneType) query.append('zoneType', params.zoneType);
      if (params.search) query.append('search', params.search);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);

      const apiUrl = `/zones?${query.toString()}`;
      const res = await Axios.get<GetZonesResponse>(apiUrl);
      return res.data;
    },
    retry: false,
    ...options,
  });
};

// Alternative: Using useApiQuery helper (for simpler cases)
export function useGetRiders(options?: GetRidersOptions) {
  return useApiQuery<GetRidersResponse>('/admin/lumi/riders', options, {
    mapper: (params) => {
      const { tab, ...rest } = params;
      const status = tab === 'all' ? '' : tab;
      return { ...rest, status };
    },
  });
}

/**
 * Hook to fetch a single zone by ID
 * @param id - Zone ID
 * @param options - React Query options
 */
export const useGetSingleZone = (
  id: string,
  options?: Omit<
    UseQueryOptions<Zone, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const queryKey = ['get-single-zone', id];
  return useQuery<Zone, ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await Axios.get<Zone>(`/zones/${id}`);
      return res.data;
    },
    retry: false,
    enabled: !!id, // Only run query if ID is provided
    ...options,
  });
};

/**
 * Hook to fetch all zones (for dropdowns/selects)
 * @param options - React Query options
 */
export function useGetAllZonesAndTiers(
  options?: Omit<
    UseQueryOptions<GetAllZonesAndTiersResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<GetAllZonesAndTiersResponse, ApiErrorResponse>({
    queryKey: ['all-zones-and-tiers'],
    queryFn: async () => {
      const { data } = await Axios.get<GetAllZonesAndTiersResponse>(
        '/commission-rules-new/all-zone-and-tiers',
      );
      return data;
    },
    retry: false,
    ...options,
  });
}

// ==================== POST Mutations ====================

/**
 * Hook to create a new zone
 * @param options - React Query mutation options
 */
export const usePostZone = (
  options?: UseMutationOptions<
    PostZoneResponse,
    ApiErrorResponse,
    PostZonePayload
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<PostZoneResponse, ApiErrorResponse, PostZonePayload>({
    mutationFn: async (data) => {
      const res = await Axios.post('/zones', data);
      return res.data;
    },
    onSuccess: (...args) => {
      // Invalidate related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// For multipart/form-data (file uploads)
export function useCreateDriver(
  options?: UseMutationOptions<
    CreateDriverResponse,
    ApiErrorResponse,
    CreateDriverPayload
  >,
) {
  return useMutation<
    CreateDriverResponse,
    ApiErrorResponse,
    CreateDriverPayload
  >({
    mutationFn: async (payload) => {
      const formData = buildFormData(payload);
      const { data } = await Axios.post<CreateDriverResponse>(
        '/admin/lumi/riders/riders',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data;
    },
    ...options,
  });
}

// ==================== PUT/PATCH Mutations ====================

/**
 * Hook to update an existing zone
 * @param options - React Query mutation options
 */
export const usePutZone = (
  options?: UseMutationOptions<Zone, ApiErrorResponse, PutZonePayload>,
) => {
  const queryClient = useQueryClient();
  return useMutation<Zone, ApiErrorResponse, PutZonePayload>({
    mutationFn: async (data) => {
      const res = await Axios.put(`/zones/${data.id}`, data);
      return res.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook to approve/reject driver (PATCH example)
 */
export const useApproveOrRejectDriver = (
  options?: UseMutationOptions<
    ApproveOrRejectDriverResponse,
    ApiErrorResponse,
    ApproveOrRejectDriverPayload
  >,
) => {
  return useMutation<
    ApproveOrRejectDriverResponse,
    ApiErrorResponse,
    ApproveOrRejectDriverPayload
  >({
    mutationFn: async (payload) => {
      const { riderId, status, rejection_reason } = payload;
      const { data } = await Axios.patch<ApproveOrRejectDriverResponse>(
        `/admin/lumi/riders/riders/${riderId}/status`,
        { status, ...(status === 'rejected' && { rejection_reason }) },
      );
      return data;
    },
    ...options,
  });
};

// ==================== DELETE Mutations ====================

/**
 * Hook to delete a zone
 * @param options - React Query mutation options
 */
export const useDeleteZone = (
  options?: UseMutationOptions<DeleteZoneResponse, ApiErrorResponse, string>,
) => {
  const queryClient = useQueryClient();
  return useMutation<DeleteZoneResponse, ApiErrorResponse, string>({
    mutationFn: async (id: string) => {
      const res = await Axios.delete(`/zones/${id}`);
      return res.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
```

---

## Integrating API Hooks in Components

### Pattern 1: List/Table Component with Pagination

**File:** `components/super-admin/your-module/table.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ApiErrorResponse, Zone } from '@/types';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useDeleteZone, useGetZones } from '@/hooks/api/super-admin/general/zones';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

export default function ZonesTable() {
  const t = useTranslations('zones');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;

  // State for modals/dialogs
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

  // ===== API HOOK USAGE =====
  // Fetch zones with loading, error states
  const { data, isLoading, isError, error } = useGetZones({
    placeholderData: (previousData) => previousData, // Keep old data while loading new
  });

  // Delete mutation with loading state
  const { mutateAsync: deleteZone, isPending: isDeletingZone } = useDeleteZone();

  const zones = data?.zones || [];
  const { items, requestSort, sortConfig } = useSortableData<Zone>(zones);

  // ===== MUTATION HANDLER =====
  const handleDelete = async () => {
    if (deletingZone) {
      try {
        await deleteZone(deletingZone.id);
        toast.success(t('deleteSuccess'));
        setDeletingZone(null);
        // Query invalidation is handled automatically in the hook
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    }
  };

  // ===== RENDER =====
  return (
    <div className="space-y-4">
      {/* Filters and Download */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<Zone>
          fileName="zones_report"
          data={zones}
          columns={zoneDownloadColumns}
        />
      </div>

      {/* Table */}
      <div className="mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={t('table.title')}
                  sortKey={'title'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                {/* More headers... */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loading State */}
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} />
              ) : isError ? (
                /* Error State */
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <DisplayError
                      title={t('errors.fetchFailedTitle')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        t('errors.fetchFailed')
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : zones.length === 0 ? (
                /* Empty State */
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <NoDataFound title={t('errors.noZones')} />
                  </TableCell>
                </TableRow>
              ) : (
                /* Data */
                items.map((zone) => (
                  <TableRow className="!h-[55px]" key={zone.id}>
                    <TableCell>{zone?.title ?? t('notAvailable')}</TableCell>
                    {/* More cells... */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical size={20} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingZone(zone)}>
                            <PenIcon className="size-[18px]" />
                            <span>{t('editZone')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingZone(zone)}>
                            <TrashIcon className="size-[18px] text-help-red" />
                            <span className="text-help-red">{t('deleteZone')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-3 bg-accent/30 border-t rounded-b-md">
            {!isLoading && !isError && items.length > 0 && (
              <AppPagination
                page={data?.currentPage || 1}
                totalPages={data?.totalPages || 1}
                totalData={data?.total || 0}
                defaultLimit={limit as TLimitType}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingZone && (
        <AppAlertDialog
          title={t('errors.deleteTitle')}
          description={t('errors.deleteDescription')}
          open={!!deletingZone}
          onOpenChange={() => setDeletingZone(null)}
          variant="delete"
          confirmLabel={t('errors.deleteConfirm')}
          onConfirm={handleDelete}
          loading={isDeletingZone}
        />
      )}
    </div>
  );
}
```

### Pattern 2: Form Component (Create/Update)

**File:** `components/super-admin/your-module/add-form.tsx`

```typescript
'use client';

import { addZoneSchema } from '@/schemas/zones/add-zone.schema';
import { ApiErrorResponse, PostZonePayload, ZoneType } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePostZone } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';

interface AddZoneFormProps {
  onClose: () => void;
}

interface FormValues {
  name: string;
  selectedTypes: string[];
  description: string;
}

const initialValues = {
  name: '',
  description: '',
  selectedTypes: [],
};

export default function AddZoneForm({ onClose }: AddZoneFormProps) {
  const t = useTranslations('zones.form');

  // ===== API HOOK USAGE =====
  const { mutateAsync: postZone, isPending: isPostingZone } = usePostZone();

  // ===== FORM SUBMIT HANDLER =====
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      // Map form values to API payload
      const zoneTypeMapping: { [key: string]: ZoneType } = {
        'LO Foods': 'food',
        'LO Drive': 'drive',
        'LO Hotels': 'hotel',
        'LO Tickets': 'ticket',
      };

      const mappedZoneTypes: ZoneType[] = values.selectedTypes.map(
        (type: string) => zoneTypeMapping[type],
      );

      const payload: PostZonePayload = {
        title: values.name,
        description: values.description,
        zoneType: mappedZoneTypes,
        zoneShape: 'Point', // Example value
      };

      // Call API
      await postZone(payload);
      toast.success(t('addSuccess'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  const types = ['LO Foods', 'LO Drive', 'LO Hotels', 'LO Tickets'];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addZoneSchema(t)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-4">
          <AppInputField
            id="zone_name"
            label={t('name')}
            name="name"
            placeholder={t('namePlaceholder')}
            requiredAsterisk
          />

          <AppInputField
            label={t('description')}
            id="zone_description"
            name="description"
            placeholder={t('descriptionPlaceholder')}
          />

          <MultiSelect
            label={t('type')}
            id="zone_type"
            name="selectedTypes"
            options={types}
            selected={values.selectedTypes}
            onChange={(value) => setFieldValue('selectedTypes', value)}
            requiredAsterisk
          />

          <div className="flex justify-end mt-5 gap-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-12"
            >
              {t('cancel')}
            </AppButton>
            <AppButton
              type="submit"
              className="px-14"
              isLoading={isSubmitting || isPostingZone}
              disabled={isSubmitting || isPostingZone}
            >
              {t('add')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
```

### Pattern 3: Detail Page with Multiple Queries

**File:** `components/super-admin/your-module/detail-page.tsx`

```typescript
'use client';

import { Rider } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveOrRejectDriver,
  useGetSingleRider,
} from '@/hooks/api/super-admin/enatega-drive/driver-management';
import { AppButton } from '@/components/shared/AppButton';
import DriverStatsCards from './DriverStatsCards';
import RideCountChart from './RideCountChart';

interface DriverDetailPageProps {
  riderId: string;
}

export function DriverDetailPage({ riderId }: DriverDetailPageProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('driverManagement');

  // ===== MULTIPLE API HOOKS =====
  const { data: rider, isLoading, isError, error } = useGetSingleRider(riderId);

  const { mutateAsync: approveOrRejectDriver, isPending: isProcessing } =
    useApproveOrRejectDriver();

  // ===== ACTION HANDLERS =====
  const handleApprove = async () => {
    if (!rider) return;

    try {
      const response = await approveOrRejectDriver({
        riderId: rider.id,
        status: 'approved',
      });
      toast.success(response.message || t('driverApprovedSuccess'));
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/admin/lumi/riders'] });
      queryClient.invalidateQueries({ queryKey: ['get-single-rider', riderId] });
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  // ===== RENDER =====
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading driver details</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rider?.userProfile.user.name}</h1>
        <AppButton
          onClick={handleApprove}
          isLoading={isProcessing}
          disabled={isProcessing}
        >
          Approve Driver
        </AppButton>
      </div>

      {/* Stats Cards */}
      <DriverStatsCards riderId={riderId} />

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <RideCountChart riderId={riderId} />
        <DriverTotalRevenueChart riderId={riderId} />
      </div>
    </div>
  );
}
```

---

## Managing Loading States

### 1. Query Loading States (GET requests)

```typescript
const { data, isLoading, isError, error } = useGetZones();

// Handle different states
if (isLoading) {
  return <TableShimmer limit={10} />; // Show skeleton loader
}

if (isError) {
  return <DisplayError message={returnErrorMessage(error)} />; // Show error
}

if (!data || data.zones.length === 0) {
  return <NoDataFound />; // Show empty state
}

// Render data
return <Table>{/* ... */}</Table>;
```

### 2. Mutation Loading States (POST/PUT/DELETE)

```typescript
const { mutateAsync: deleteZone, isPending: isDeleting } = useDeleteZone();

// In your button or dialog
<AppButton
  onClick={handleDelete}
  isLoading={isDeleting}
  disabled={isDeleting}
>
  Delete
</AppButton>

// OR using Formik with isSubmitting
<AppButton
  type="submit"
  isLoading={isSubmitting || isPostingZone}
  disabled={isSubmitting || isPostingZone}
>
  Submit
</AppButton>
```

### 3. Optimistic Updates with placeholderData

```typescript
const { data } = useGetZones({
  placeholderData: (previousData) => previousData, // Keeps old data visible while fetching new
});
```

### 4. Conditional Loading (Skeleton Components)

```typescript
// Create reusable skeleton components
const { isLoading } = useGetZones();

{isLoading && <TableShimmer limit={10} columns={7} />}
{isLoading && <DriverStatsCardsSkeleton />}
{isLoading && <DriverTotalRevenueChartSkeleton />}
```

---

## Error Handling

### 1. Using Error Handling Utilities

**File:** `lib/toast-error.ts`

```typescript
import { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';

// Returns error message string without showing toast
export const returnErrorMessage = (error: ApiErrorResponse) => {
  const errorMsg = error?.response?.data?.message;
  if (Array.isArray(errorMsg)) {
    return errorMsg.join(', ');
  } else if (errorMsg) {
    return errorMsg;
  } else {
    return 'Something went wrong. Please try again.';
  }
};

// Shows error as toast notification
export const handleApiError = (error: ApiErrorResponse) => {
  const errorMsg = error?.response?.data?.message;
  if (Array.isArray(errorMsg)) {
    toast.error(errorMsg.join(', '));
  } else if (errorMsg) {
    toast.error(errorMsg);
  } else {
    toast.error('Something went wrong. Please try again.');
  }
};
```

### 2. Try-Catch Pattern in Components

```typescript
import { handleApiError } from '@/lib/toast-error';

const handleDelete = async () => {
  try {
    await deleteZone(zoneId);
    toast.success('Zone deleted successfully');
    setDeletingZone(null);
  } catch (error) {
    handleApiError(error as ApiErrorResponse);
  }
};
```

### 3. Displaying Error Messages in UI

```typescript
const { data, isLoading, isError, error } = useGetZones();

{isError && (
  <DisplayError
    title="Failed to fetch zones"
    message={returnErrorMessage(error as ApiErrorResponse)}
  />
)}
```

### 4. Global Error Handling with Axios Interceptors

The Axios config already handles global 401 errors (redirects to login). You can extend this for other global error patterns:

```typescript
// config/axios.ts
Axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Redirect to login
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  },
);
```

---

## Complete Example: Building a New Module

Let's walk through creating a complete **Categories** module:

### Step 1: Create Types

**File:** `types/entities/super-admin/categories.d.ts`

```typescript
export interface Category extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**File:** `types/api/super-admin/categories.api.d.ts`

```typescript
import { Category } from '@/types/entities/super-admin/categories';

export interface GetCategoriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetCategoriesResponse {
  categories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface PostCategoryPayload {
  name: string;
  description: string;
  isActive: boolean;
}

export type PostCategoryResponse = Category;

export interface PutCategoryPayload extends PostCategoryPayload {
  id: string;
}

export interface DeleteCategoryResponse {
  message: string;
}
```

### Step 2: Create API Hooks

**File:** `hooks/api/super-admin/categories.ts`

```typescript
import {
  ApiErrorResponse,
  Category,
  DeleteCategoryResponse,
  GetCategoriesQueryParams,
  GetCategoriesResponse,
  PostCategoryPayload,
  PostCategoryResponse,
  PutCategoryPayload,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';

export const useGetCategories = (
  options?: Omit<
    UseQueryOptions<GetCategoriesResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const search = getParam('search') || undefined;
  const isActive =
    getParam('isActive') === 'true'
      ? true
      : getParam('isActive') === 'false'
        ? false
        : undefined;

  return useQuery<GetCategoriesResponse, ApiErrorResponse>({
    queryKey: ['get-categories', { page, limit, search, isActive }],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('page', String(page));
      query.append('limit', String(limit));
      if (search) query.append('search', search);
      if (isActive !== undefined) query.append('isActive', String(isActive));

      const res = await Axios.get<GetCategoriesResponse>(
        `/categories?${query.toString()}`,
      );
      return res.data;
    },
    retry: false,
    ...options,
  });
};

export const usePostCategory = (
  options?: UseMutationOptions<
    PostCategoryResponse,
    ApiErrorResponse,
    PostCategoryPayload
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PostCategoryResponse,
    ApiErrorResponse,
    PostCategoryPayload
  >({
    mutationFn: async (data) => {
      const res = await Axios.post('/categories', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-categories'] });
    },
    ...options,
  });
};

export const usePutCategory = (
  options?: UseMutationOptions<Category, ApiErrorResponse, PutCategoryPayload>,
) => {
  const queryClient = useQueryClient();
  return useMutation<Category, ApiErrorResponse, PutCategoryPayload>({
    mutationFn: async (data) => {
      const res = await Axios.put(`/categories/${data.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-categories'] });
    },
    ...options,
  });
};

export const useDeleteCategory = (
  options?: UseMutationOptions<
    DeleteCategoryResponse,
    ApiErrorResponse,
    string
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<DeleteCategoryResponse, ApiErrorResponse, string>({
    mutationFn: async (id) => {
      const res = await Axios.delete(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-categories'] });
    },
    ...options,
  });
};
```

### Step 3: Create Table Component

**File:** `components/super-admin/categories/table.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ApiErrorResponse, Category } from '@/types';
import { MoreVertical, PenIcon, Plus, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useDeleteCategory, useGetCategories } from '@/hooks/api/super-admin/categories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { TableShimmer } from '@/components/shared/TableShimmer';
import Status from '@/components/shared/Status';

export default function CategoriesTable() {
  const t = useTranslations('categories');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data, isLoading, isError, error } = useGetCategories();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const categories = data?.categories || [];

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast.success(t('deleteSuccess'));
      setDeletingCategory(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10} columns={4} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <DisplayError message={returnErrorMessage(error as ApiErrorResponse)} />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <NoDataFound title={t('noCategories')} />
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Status status={category.isActive ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setDeletingCategory(category)}>
                      <TrashIcon size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {deletingCategory && (
        <AppAlertDialog
          title={t('deleteTitle')}
          description={t('deleteDescription')}
          open={!!deletingCategory}
          onOpenChange={() => setDeletingCategory(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
          variant="delete"
        />
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Query Keys

- Use descriptive, hierarchical query keys: `['get-paginated-zones', params]`
- Include relevant parameters in the key for proper caching

### 2. Query Invalidation

- Always invalidate related queries after mutations
- Use specific query keys for targeted invalidation

```typescript
queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
```

### 3. Error Boundaries

- Wrap components in Error Boundaries for better error handling
- Provide fallback UIs for error states

### 4. Loading States

- Show skeleton loaders during data fetching
- Disable buttons during mutations
- Use optimistic updates where appropriate

### 5. Type Safety

- Always use TypeScript for API responses and payloads
- Define proper types in separate files
- Reuse common types like `ApiErrorResponse`

### 6. FormData Handling

For file uploads, use the `buildFormData` utility:

```typescript
import buildFormData from '@/lib/build-form-data';

const formData = buildFormData(payload);
await Axios.post('/endpoint', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

## Summary Checklist

When creating a new module with API integration:

- [ ] **Types**: Create entity types in `types/entities/super-admin/`
- [ ] **API Types**: Create request/response types in `types/api/super-admin/`
- [ ] **API Hooks**: Create hooks in `hooks/api/super-admin/`
- [ ] **Component**: Create component with proper loading/error states
- [ ] **Error Handling**: Use `handleApiError` and `returnErrorMessage`
- [ ] **Query Invalidation**: Invalidate queries after mutations
- [ ] **Loading States**: Show skeletons during loading
- [ ] **Testing**: Test all API calls and error scenarios

---

## Additional Resources

- **React Query Documentation**: https://tanstack.com/query/latest
- **Axios Documentation**: https://axios-http.com/docs/intro
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
