export function mapAppType(appType: string) {
    switch (appType) {
        case 'rider-app':
            return 'RIDER';
        case 'store-app':
            return 'STORE';
        case 'customer-app':
            return 'CUSTOMER';
        case 'web':
            return 'WEB';
        case 'admin':
            return 'ADMIN';
        default:
            return '';
    }
}
