import { formatDateTime } from '@/lib/formatDateTime';
import { Coupon } from '@/types';

export const getDownloadColumns = (t: (key: string) => string) => [
    { header: t('discountCode'), dataKey: 'code' },
    { header: t('title'), dataKey: 'title' },
    { header: t('discountType'), dataKey: 'discount_type' },
    { header: t('value'), dataKey: 'values' },
    {
        header: t('usageLimit'),
        dataKey: 'usage_limit',
        formatter: (item: Coupon) =>
            `${t('usageTotal')}: ${item.usage_limit.total}\n${t('usagePerUser')}: ${item.usage_limit.per_user}`,
    }, {
        header: t('validityFrom'),
        dataKey: 'validity_from',
        formatter: (item: Coupon) =>
            item.validity
                ? formatDateTime(item.validity.start_date, "N/A")
                : t('download.notAvailable'),
    },
    {
        header: t('validityTo'),
        dataKey: 'validity_to',
        formatter: (item: Coupon) =>
            item.validity
                ? formatDateTime(item.validity.end_date, "N/A")
                : "N/A",
    },
    { header: t('storesName'), dataKey: 'store_name' },
    { header: t('status'), dataKey: 'status' },
];
