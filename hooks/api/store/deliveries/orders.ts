import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse, CustomerInfo, DeliveryInfo, GetOrdersQueryParams, GetOrdersResponse, OrderDetail, OrderDetailResponse, OrderLog, OrderProduct, OrderSummary, PaymentInfo, RiderInfo } from '@/types';
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';


export const useGetStoreOrders = (
    options?: Omit<UseQueryOptions<GetOrdersResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) => {
    const { getParam } = useQueryParams();
    const paramsRoute = useParams();
    const storeIdParam = paramsRoute.storeId;
    const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const rawStatus = getParam('status');
    const status = rawStatus && rawStatus !== 'all' ? rawStatus : undefined;
    const rawStart = getParam('startDate') || undefined;
    const rawEnd = getParam('endDate') || undefined;
    const orderType = getParam('orderType') || undefined;
    const categoryId = getParam('categoryId') || undefined;
    const startDate = rawStart ? new Date(rawStart).toISOString() : undefined;
    const endDate = rawEnd ? new Date(rawEnd).toISOString() : undefined;

    const params: GetOrdersQueryParams = {
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
        orderType,
        categoryId,
    };

    const queryKey = ['get-orders-store', storeId, params];

    return useQuery<GetOrdersResponse, ApiErrorResponse>({
        queryKey,
        enabled: !!storeId,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.search) query.append('search', params.search);
            if (params.status) query.append('status', params.status);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);
            if (params.orderType) query.append('orderType', params.orderType);
            if (params.categoryId) query.append('categoryId', params.categoryId);

            const apiUrl = `/apps/deliveries/store/orders/${storeId}?${query.toString()}`;
            const res = await Axios.get<GetOrdersResponse>(apiUrl);
            return res.data;
        },
        ...options,
    });
};

export const useGetStoreOrderDetail = (
    orderId?: string,
    options?: Omit<UseQueryOptions<OrderDetail, ApiErrorResponse, OrderDetail, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) => {
    const paramsRoute = useParams();
    const storeIdParam = paramsRoute.storeId;
    const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;

    return useQuery<OrderDetail, ApiErrorResponse>({
        queryKey: ['get-store-order', storeId, orderId],
        enabled: !!orderId && !!storeId,
        queryFn: async () => {
            const apiUrl = `/apps/deliveries/store/orders/${storeId}/order/${orderId}`;
            const res = await Axios.get<OrderDetailResponse>(apiUrl);
            const data: OrderDetailResponse = res.data || {};

            const summary: OrderSummary = data.orderSummary || {};
            const payment: PaymentInfo | undefined = data.paymentInfo;
            const customerRaw: CustomerInfo | undefined = data.customerInfo;
            const riderRaw: RiderInfo | undefined = data.riderInfo;
            const delivery: DeliveryInfo | undefined = data.deliveryInfo;

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
                adminCommission: summary.adminCommission ?? payment?.adminCommission ?? 0,
                storeEarnings: payment?.storeEarnings ?? 0,
                riderAssigned: !!rider?.name,
                dateTime: summary.dateTime as string | undefined,
                // copy deliveryInfo to top-level convenience fields
                pickupAddress: delivery?.pickupAddress ?? undefined,
                dropoffAddress: delivery?.dropoffAddress ?? undefined,
                distance: delivery?.distance ?? null,
                eta: delivery?.eta ?? null,
            };

            return mapped;
        },
        ...options,
    });
};

type StoreOrderActionResponse = {
    message: string;
    orderId: string;
    status: string;
};

export const useAcceptStoreOrder = (
    options?: UseMutationOptions<StoreOrderActionResponse, ApiErrorResponse, string>,
) => {
    const queryClient = useQueryClient();
    const paramsRoute = useParams();
    const rawStoreId = paramsRoute.storeId;
    const storeId = Array.isArray(rawStoreId) ? rawStoreId[0] : rawStoreId;

    return useMutation<StoreOrderActionResponse, ApiErrorResponse, string>({
        mutationFn: async (orderId) => {
            const { data } = await Axios.patch<StoreOrderActionResponse>(
                `/apps/deliveries/store/orders/${storeId}/order/${orderId}/accept`,
            );
            return data;
        },
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['get-orders-store'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['get-store-order', storeId, orderId] });
        },
        ...options,
    });
};

export const useRejectStoreOrder = (
    options?: UseMutationOptions<StoreOrderActionResponse, ApiErrorResponse, { orderId: string; reason: string }>,
) => {
    const queryClient = useQueryClient();
    const paramsRoute = useParams();
    const rawStoreId = paramsRoute.storeId;
    const storeId = Array.isArray(rawStoreId) ? rawStoreId[0] : rawStoreId;

    return useMutation<StoreOrderActionResponse, ApiErrorResponse, { orderId: string; reason: string }>({
        mutationFn: async ({ orderId, reason }) => {
            const { data } = await Axios.patch<StoreOrderActionResponse>(
                `/apps/deliveries/store/orders/${storeId}/order/${orderId}/reject`,
                { reason },
            );
            return data;
        },
        onSuccess: (_data, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: ['get-orders-store'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['get-store-order', storeId, orderId] });
        },
        ...options,
    });
};
