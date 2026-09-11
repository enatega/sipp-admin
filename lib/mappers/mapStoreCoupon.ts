import { Coupon, StoreCoupon } from '@/types';

export function mapStoreCouponToTableCoupon(coupon: StoreCoupon): Coupon {
    return {
        max_discount_cap: Number(coupon.max_discount_cap) || 0,
        id: coupon.id,
        code: coupon.discount_code,
        values: coupon.value,
        title: coupon.title,
        discount_type: coupon.discount_type as Coupon['discount_type'],
        usage_limit: {
            total: coupon.usage_limit,
            per_user: coupon.usage_per_user,
        },
        validity: {
            start_date: coupon.validity.start_date,
            end_date: coupon.validity.end_date,
            active_immediately: false,
        },
        stores: coupon.stores,
        status: coupon.status as Coupon['status'],
        description: '',
        minimum_order_value: 0,
        payment_method: [],
        delivery_type: [],
        for_new_user_only: false,
        for_premium_shops_only: false,
        applied_to: 'store',
        store_name: coupon.stores?.[0]?.name ?? '',
    };
}
