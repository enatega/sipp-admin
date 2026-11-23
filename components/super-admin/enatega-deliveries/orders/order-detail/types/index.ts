import type { ReactNode } from 'react';
import { OrderDetail } from '@/types';

export interface IOrderDetailMainProps {
    order: OrderDetail;
    /** Admin-only section; the store view leaves it out. */
    adminNote?: ReactNode;
}

export interface ILeftColumnProps {
    order: OrderDetail;
}

export interface IRightColumnProps {
    order: OrderDetail;
    adminNote?: ReactNode;
}
