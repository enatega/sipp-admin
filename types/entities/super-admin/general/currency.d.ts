export interface Currency extends Record<string, unknown> {
    id: string;
    code: string;
    name: string;
    symbol: string;
    rateToBase: string;
    usdConversionRate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
