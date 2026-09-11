
export interface DeliveryFeeSettingsResponse {
    id: string;
    fixed_delivery_fee: string;
    base_distance_fee: string;
    distance_greater_than: number;
    per_km_charges: string;
    apply_base_fee_up_per_km: boolean;
    min_order_value: string;
    delivery_fee_above_min_order: string;
    free_delivery_above_amount: string | null;
    is_fixed_delivery_fee_active: boolean;
    is_distance_delivery_fee_active: boolean;
}

export interface UpdateFixedDeliveryFeePayload {
    fixed_delivery_fee?: number;
    is_active?: boolean;
}
export interface UpdateDistanceDeliveryFeePayload {
    base_distance_fee?: number;
    distance_greater_than?: number;
    per_km_charges?: number;
    apply_base_fee_up_per_km?: boolean;
    is_active?: boolean;
}
export interface UpdateOrderValueBaseDeliveryFeePayload {
    min_order_value: number;
    delivery_fee_above_min_order: number;
    free_delivery_above_amount?: number;
}
