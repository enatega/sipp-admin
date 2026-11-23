import * as Yup from 'yup';

export const editShopTypeCommissionSchema = Yup.object().shape({
    storeType: Yup.string().required('Store Type is required'),
    shopType: Yup.string().required('Shop Type is required'),
    commissionRate: Yup.number()
        .required('Commission rate is required')
        .min(0, 'Commission rate must be non-negative'),
    settlementCycle: Yup.string().required('Settlement cycle is required'),
});
