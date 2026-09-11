import type {
    OrderDetail as EntitiesOrderDetail,
    OrderLog as EntitiesOrderLog,
    OrderProduct,
} from '@/types';

export interface Addon {
    name: string;
    price: number;
}

export type OrderLog = EntitiesOrderLog;

export type OrderItem = OrderProduct & {
    finalPrice?: number;
    quantity?: number;
    addon?: string;
    addons?: Addon[];
};

export type OrderService = OrderProduct & {
    price?: number;
    baseFee?: number;
    addon?: string;
    addons?: Addon[];
    notes?: string;
    finalPrice?: number;
    image?: string | null;
    duration?: string;
};

export type Order = EntitiesOrderDetail & Record<string, unknown>;

export type { OrderProduct };

