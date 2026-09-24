import Axios from '@/config/axios';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse, AssignRiderResponse, AvailableRider, CustomerInfo, DeliveryInfo, GetAllAvailableCategoriesQueryParams, GetAllAvailableCategoriesResponse, GetOrdersQueryParams, GetOrdersResponse, GetSimpleStoresListResponse, OrderDetail, OrderDetailResponse, OrderLog, OrderProduct, OrderSummary, PaymentInfo, RiderInfo } from '@/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

const normalizeTextValue = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'n/a') return null;
    return trimmed;
};





export const useGetOrders = (
    queryParams?: {
        start_date?: string;
        end_date?: string;
    },
) => {
    const { getParam } = useQueryParams();
    const modeScope = useDeliveriesAdminModeScope();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const status = getParam('status') || undefined;
    const rawStart = queryParams?.start_date || getParam('start_date') || undefined;
    const rawEnd = queryParams?.end_date || getParam('end_date') || undefined;
    const vendorId = getParam('vendorId') || undefined;
    const storeId = getParam('store') || undefined;
    const orderType = getParam('order_type') || undefined;
    const categoryId = getParam('categoryId') || undefined;
    const startDate = rawStart || undefined;
    const endDate = rawEnd || undefined;

    const params: GetOrdersQueryParams = {
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
        vendorId,
        storeId,
        orderType,
        categoryId,
        modeScope,
    };

    const queryKey = ['get-orders', params];

    return useQuery<GetOrdersResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.search) query.append('search', params.search);
            if (params.status) query.append('status', params.status);
            if (params.startDate) query.append('start_date', params.startDate);
            if (params.endDate) query.append('end_date', params.endDate);
            if (params.vendorId) query.append('vendorId', params.vendorId);
            if (params.storeId) query.append('store', params.storeId);
            if (params.orderType) query.append('order_type', params.orderType);
            if (params.categoryId) query.append('categoryId', params.categoryId);
            if ((params as typeof params & { modeScope?: string }).modeScope) {
                query.append('modeScope', (params as typeof params & { modeScope?: string }).modeScope as string);
            }

            const apiUrl = `/apps/deliveries/super-admin/orders?${query.toString()}`;
            const res = await Axios.get<GetOrdersResponse>(apiUrl);
            const normalizedData = (res.data?.data || []).map((order) => {
                const riderInfo = (order as unknown as { riderInfo?: { id?: unknown; name?: unknown; phone?: unknown; email?: unknown } }).riderInfo;

                const riderId = normalizeTextValue(order.riderId) ?? normalizeTextValue(riderInfo?.id);
                const riderName = normalizeTextValue(order.riderName) ?? normalizeTextValue(riderInfo?.name);
                const riderPhone = normalizeTextValue(order.riderPhone) ?? normalizeTextValue(riderInfo?.phone);

                return {
                    ...order,
                    riderId: riderId ?? null,
                    riderName: riderName ?? null,
                    riderPhone: riderPhone ?? null,
                    riderInfo: riderInfo
                        ? {
                            id: normalizeTextValue(riderInfo.id),
                            name: normalizeTextValue(riderInfo.name),
                            phone: normalizeTextValue(riderInfo.phone),
                            email: normalizeTextValue(riderInfo.email),
                        }
                        : null,
                };
            });

            return {
                ...res.data,
                data: normalizedData,
            };
        },
    });
};

export const useGetOrderDetail = (
    orderId?: string,
    options?: Omit<UseQueryOptions<OrderDetail, ApiErrorResponse, OrderDetail, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) => {
    const modeScope = useDeliveriesAdminModeScope();
    return useQuery<OrderDetail, ApiErrorResponse>({
        queryKey: ['get-order', orderId, modeScope ?? null],
        enabled: !!orderId,
        queryFn: async () => {
            const apiUrl = modeScope
                ? `/apps/deliveries/super-admin/orders/${orderId}?modeScope=${modeScope}`
                : `/apps/deliveries/super-admin/orders/${orderId}`;
            const res = await Axios.get<OrderDetailResponse>(apiUrl);
            const data: OrderDetailResponse = res.data || {};

            const summary: OrderSummary = data.orderSummary || {};
            const payment: PaymentInfo | undefined = data.paymentInfo;
            const customerRaw: CustomerInfo | undefined = data.customerInfo;
            const riderRaw: RiderInfo | undefined = data.riderInfo;
            const delivery: DeliveryInfo | undefined = data.deliveryInfo;

            // normalize customer and rider and prefer common avatar fields
            const customer: CustomerInfo | undefined = customerRaw
                ? {
                    ...customerRaw,
                    avatar: customerRaw.avatar ?? null,
                }
                : undefined;

            const rider: RiderInfo | undefined = riderRaw
                ? {
                    ...riderRaw,
                    avatar: riderRaw.avatar ?? null,
                }
                : undefined;

            const rawItems: OrderProduct[] = data.items?.products ?? [];

            const items: OrderProduct[] = rawItems.map((p: OrderProduct) => ({
                id: p.id,
                itemName: p.itemName ?? (p.name ?? p.title) ?? '',
                quantity: p.quantity ?? p.qty ?? 1,
                price: p.price ?? p.unitPrice ?? 0,
                finalPrice: p.finalPrice ?? p.totalPrice ?? p.price ?? 0,
                image: p.image ?? p.imageUrl ?? null,
                selectedOptions: p.selectedOptions ?? [],
                addons: p.addons,
                addon: p.addon,
            }));

            const logsSource: OrderLog[] = (data.orderLogs ?? data.statusTimeline ?? []);
            const logs: OrderLog[] = logsSource.map((l: OrderLog) => ({
                // Support multiple backend shapes (statusTimeline uses actor/timestamp/message)
                status: l.status ?? l.state ?? '',
                by: l.by ?? l.actor ?? '',
                date: l.date ?? l.timestamp ?? '',
                ipDevice: l.ipDevice ?? l.ip ?? l.ip_device ?? '',
                notes: l.notes ?? l.message ?? '',
            }));

            const amount =
                (summary.orderAmount as number | undefined) ??
                payment?.totalAmount ??
                data.items?.totalPrice ??
                0;

            const mapped: OrderDetail = {
                orderId: (summary.orderId ?? summary.id ?? '') as string,
                summary,
                items,
                payment: payment ?? null,
                customer: customer,
                rider: rider,
                delivery: delivery,
                logs,
                // convenience fields
                vendor: summary.vendor ?? '',
                store: summary.storeName ?? '',
                product: items[0]?.itemName ?? '',
                orderType: summary.orderType ?? '',
                amount: amount,
                currency: payment?.currency ?? '',
                status: summary.status ?? '',
                paymentMethod: payment?.paymentMethod ?? summary.paymentMethod ?? null,
                subtotal: payment?.subtotal ?? 0,
                taxes: payment?.taxes ?? 0,
                discounts: payment?.discounts ?? 0,
                deliveryFee: payment?.deliveryFee ?? 0,
                riderTip: payment?.riderTip ?? 0,
                riderEarnings: summary.riderEarnings ?? 0,
                riderDeliveryEarning:
                    payment?.riderDeliveryEarning ?? summary.riderDeliveryEarning ?? 0,
                riderPlatformCommission:
                    payment?.riderPlatformCommission ?? summary.riderPlatformCommission ?? 0,
                riderCommissionPercentage:
                    payment?.riderCommissionPercentage ?? summary.riderCommissionPercentage ?? 0,
                adminCommission: summary.adminCommission ?? payment?.adminCommission ?? 0,
                storeEarnings: payment?.storeEarnings ?? 0,
                riderAssigned: !!rider?.name,
                dateTime: summary.dateTime as string | undefined,
                pickupLocation: delivery?.pickupLocation
                    ? { lat: delivery.pickupLocation.latitude, lng: delivery.pickupLocation.longitude }
                    : null,
                dropoffLocation: delivery?.deliveryLocation
                    ? { lat: delivery.deliveryLocation.latitude, lng: delivery.deliveryLocation.longitude }
                    : null,
                riderLocation: riderRaw?.riderLocation
                    ? { lat: riderRaw.riderLocation.latitude, lng: riderRaw.riderLocation.longitude }
                    : null,
            };

            return mapped;
        },
        ...options,
    });
};

export const useDeleteOrder = (
    options?: UseMutationOptions<unknown, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();
    return useMutation<unknown, ApiErrorResponse, string>({
        mutationFn: async (orderId) => {
            const res = await Axios.delete(`/apps/deliveries/super-admin/orders/${orderId}`);
            return res.data;
        },
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['get-orders'], exact: false });
            if (orderId) {
                queryClient.invalidateQueries({ queryKey: ['get-order', orderId] });
            }
        },
        ...options,
    });
};

export const useGetAvailableRiders = (
    orderId?: string,
    options?: Omit<UseQueryOptions<AvailableRider[] | undefined, ApiErrorResponse, AvailableRider[] | undefined, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) => {
    return useQuery<AvailableRider[] | undefined, ApiErrorResponse>({
        queryKey: ['get-available-riders', orderId],
        enabled: !!orderId,
        queryFn: async () => {
            const res = await Axios.get(`/apps/deliveries/super-admin/orders/${orderId}/riders`);
            const data = res.data;
            if (Array.isArray(data)) return data as AvailableRider[];
            if (Array.isArray(data?.riders)) return data.riders as AvailableRider[];
            if (Array.isArray(data?.data)) return data.data as AvailableRider[];
            if (Array.isArray(data?.results)) return data.results as AvailableRider[];
            if (Array.isArray(data?.data?.data)) return data.data.data as AvailableRider[];

            return [];
        },
        ...options,
    });
};

/**
 * Assign a rider to an order
 */
export const useAssignRiderToOrder = (
    options?: UseMutationOptions<AssignRiderResponse, ApiErrorResponse, { orderId: string; riderId: string }>
) => {
    const queryClient = useQueryClient();
    return useMutation<AssignRiderResponse, ApiErrorResponse, { orderId: string; riderId: string }>({
        mutationFn: async ({ orderId, riderId }) => {
            const res = await Axios.patch<AssignRiderResponse>(
                `/apps/deliveries/super-admin/orders/${orderId}/assign-rider/${riderId}`,
            );
            return res.data;
        },
        onSuccess: (_data, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: ['get-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['get-available-riders', orderId] });
            queryClient.invalidateQueries({ queryKey: ['get-orders'], exact: false });
        },
        ...options,
    });
};

/**
 * Auto-assign the best available rider to an order
 */
export const useAutoAssignRider = (
    options?: UseMutationOptions<AssignRiderResponse, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();
    return useMutation<AssignRiderResponse, ApiErrorResponse, string>({
        mutationFn: async (orderId: string) => {
            const res = await Axios.patch<AssignRiderResponse>(
                `/apps/deliveries/super-admin/orders/${orderId}/auto-assign-rider`,
            );
            return res.data;
        },
        onSuccess: (_data, orderId) => {
            if (orderId) {
                queryClient.invalidateQueries({ queryKey: ['get-order', orderId] });
                queryClient.invalidateQueries({ queryKey: ['get-available-riders', orderId] });
            }

            queryClient.invalidateQueries({ queryKey: ['get-orders'], exact: false });
        },
        ...options,
    });
};

export const useGetSimpleStores = (
    options?: Omit<UseQueryOptions<GetSimpleStoresListResponse, ApiErrorResponse, GetSimpleStoresListResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) => {
    return useQuery<GetSimpleStoresListResponse, ApiErrorResponse>({
        queryKey: ['simple-delivery-stores'],
        queryFn: async () => {
            const { data } = await Axios.get<GetSimpleStoresListResponse>(
                '/apps/deliveries/stores/simple-stores',
            );
            // API returns a plain array
            return Array.isArray(data) ? data : [];
        },
        ...options,
    });
};

export const useGetAllAvailableCategories = (
    params?: GetAllAvailableCategoriesQueryParams,
    options?: Omit<UseQueryOptions<GetAllAvailableCategoriesResponse, ApiErrorResponse, GetAllAvailableCategoriesResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) => {
    return useQuery<GetAllAvailableCategoriesResponse, ApiErrorResponse>({
        queryKey: ['all-available-delivery-categories', params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params?.search) query.append('search', params.search);
            if (params?.includeInactive !== undefined)
                query.append('includeInactive', String(params.includeInactive));

            const qs = query.toString();
            const { data } = await Axios.get<GetAllAvailableCategoriesResponse>(
                `/apps/deliveries/categories/all-available${qs ? `?${qs}` : ''}`,
            );
            return data;
        },
        ...options,
    });
};
