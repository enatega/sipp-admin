
export interface Step1Data {
    couponName: string;
    couponCode: string;
    couponDescription: string;
}
export interface Step2Data {
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscountCap?: number;
    minOrderValue: number;
    totalUsageLimit: number;
}

export interface Step3Data {
    products: string[] | null;
    // vendors: string;
    stores: string[] | null;
    usagePerUser: number;
}

export interface Step4Data {
    startDate: string;
    endDate: string;
    activeImmediately: boolean;
}

export interface Step5Data {
    paymentMethod: string[];
    deliveryType: string[];
    forNewUserOnly: boolean;
    forPremiumShopOnly: boolean;
    // premiumShop: string;
}

export interface AddCouponFormData {
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3: Step3Data | null;
    step4: Step4Data | null;
    step5: Step5Data | null;
}

export interface EditCouponFormData extends Step1Data, Step2Data, Step3Data, Step4Data, Step5Data {
    id: number;
    isAlreadyActive?: boolean;
}
