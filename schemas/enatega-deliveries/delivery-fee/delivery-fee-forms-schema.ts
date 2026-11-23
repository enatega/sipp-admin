import * as Yup from 'yup';
export const fixedDeliveryFeeSchema = Yup.object({
    fixed_delivery_fee: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Fee cannot be negative')
        .required('Fixed delivery fee is required'),
});



export const distanceBaseFeeSchema = Yup.object({
    base_distance_fee: Yup.number().min(0, 'Cannot be negative').nullable(),
    distance_greater_than: Yup.number()
        .min(0, 'Must be positive')
        .test(
            'half-kilometre-step',
            'Distance must use 0.5 km increments',
            (value) => value === undefined || Number.isInteger(value * 2),
        )
        .required('Distance is required'),
    per_km_charges: Yup.number()
        .min(0, 'Cannot be negative')
        .required('Per km charge is required'),
    apply_base_fee_up_per_km: Yup.boolean(),
});

export const orderValueBaseFeeSchema = Yup.object({
    min_order_value: Yup.number()
        .min(0, 'Cannot be negative')
        .required('Minimum order value is required'),
    delivery_fee_above_min_order: Yup.number()
        .min(0, 'Cannot be negative')
        .required('Delivery fee is required'),
});
