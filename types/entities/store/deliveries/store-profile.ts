export interface AssociatedVendor {
    vendorName: string;
    vendorId: string
}

export interface StoreTimingSlot {
    open: string;
    close: string;
}

export interface StoreTimingDay {
    is_active: boolean;
    slots: StoreTimingSlot[];
}

export type StoreTimingsPayload = {
    [day: string]: StoreTimingDay;
};