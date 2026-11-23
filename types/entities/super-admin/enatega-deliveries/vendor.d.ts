export interface Vendor extends Record<string, unknown> {
    id: string;
    name: string;
    email: string;
    phone: string;
    shopType: string;
    zoneType: string;
    totalSales: number;
    totalOrders: number;
    totalStores: number;
    registrationDate: string;
    createdAt: string;
    status: string;
    rejection_reason: string | null;
    bankName: string;
    branchCode: string;
    accountTitle: string;
    accountNumber: string;
    // API response fields
    createdat?: string;
    zoneid?: string;
    zonename?: string;
    shoptypeid?: string;
    shoptypename?: string;
    activestatus?: boolean;
    blockstatus?: boolean;
}
 