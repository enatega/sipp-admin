import { Store } from '@/types/entities/super-admin/enatega-deliveries/store-form';

export const shopTypeLabels: Record<string, string> = {
  restaurant: 'Restaurant',
  grocery: 'Grocery',
  pharmacy: 'Pharmacy',
  convenience: 'Convenience',
};

export const storeTypeLabels: Record<string, string> = {
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  all: 'All',
};

// Mock vendor ID - in production this would come from auth context
const MOCK_VENDOR_ID = 'vendor-1';

// Vendor stores (with vendorId for internal filtering)
const vendorStoresWithId = [
  {
    id: '1',
    name: 'Pizza Palace',
    phone: '+1 234 567 8901',
    email: 'pizza@palace.com',
    address: '123 Main St, New York, NY',
    logo: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBpenphfGVufDB8fDB8fHww',
    shopType: 'restaurant',
    storeType: 'delivery',
    zoneId: 'z1',
    zoneName: 'Downtown',
    status: 'active',
    isPublished: true,
    isAvailable: true,
    activeOrders: 5,
    totalSales: 1540.5,
    rating: 4.5,
    vendorId: MOCK_VENDOR_ID,
  },
  {
    id: '2',
    name: 'Fresh Mart Grocery',
    phone: '+1 234 567 8902',
    email: 'fresh@mart.com',
    address: '456 Oak Ave, Los Angeles, CA',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z3JvY2VyeXxlbnwwfHwwfHx8MA%3D%3D',
    shopType: 'grocery',
    storeType: 'all',
    zoneId: 'z2',
    zoneName: 'Westside',
    status: 'active',
    isPublished: true,
    isAvailable: true,
    activeOrders: 12,
    totalSales: 3200.75,
    rating: 4.2,
    vendorId: MOCK_VENDOR_ID,
  },
  {
    id: '3',
    name: 'HealthCare Pharmacy',
    phone: '+1 234 567 8903',
    email: 'health@care.com',
    address: '789 Elm Blvd, Chicago, IL',
    logo: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBoYXJtYWN5fGVufDB8fDB8fHww',
    shopType: 'pharmacy',
    storeType: 'delivery',
    zoneId: 'z1',
    zoneName: 'Downtown',
    status: 'pending',
    isPublished: false,
    isAvailable: false,
    activeOrders: 0,
    totalSales: 0,
    rating: 0,
    vendorId: MOCK_VENDOR_ID,
  },
  {
    id: '5',
    name: 'Burger Barn',
    phone: '+1 234 567 8905',
    email: 'burger@barn.com',
    address: '555 Maple Dr, Phoenix, AZ',
    logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YnVyZ2VyfGVufDB8fDB8fHww',
    shopType: 'restaurant',
    storeType: 'dine_in',
    zoneId: 'z2',
    zoneName: 'Westside',
    status: 'blocked',
    isPublished: false,
    isAvailable: false,
    activeOrders: 0,
    totalSales: 0,
    rating: 2.5,
    vendorId: MOCK_VENDOR_ID,
  },
  {
    id: '10',
    name: 'Green Grocers',
    phone: '+1 234 567 8910',
    email: 'lisa@greengrocers.com',
    address: '222 Park Ave, Chicago, IL',
    logo: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhYmxlc3xlbnwwfHwwfHx8MA%3D%3D',
    shopType: 'grocery',
    storeType: 'all',
    zoneId: 'z1',
    zoneName: 'Downtown',
    status: 'pending',
    isPublished: false,
    isAvailable: true,
    activeOrders: 2,
    totalSales: 45.0,
    rating: 0,
    vendorId: MOCK_VENDOR_ID,
  },
].filter((store) => store.vendorId === MOCK_VENDOR_ID);

// Filter stores to show only vendor's stores
export const dummyVendorStores: Store[] = vendorStoresWithId.map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ vendorId, ...store }) => store
) as Store[];


export const getDownloadColumns = (t: (key: string) => string) => [
  { header: t('download.name'), dataKey: 'name' },
  { header: t('download.totalSales'), dataKey: 'totalSales' },
  { header: t('download.phone'), dataKey: 'phone' },
  {
    header: t('download.shopType'),
    dataKey: 'shopType',
    formatter: (item: Store) => shopTypeLabels[item.shopType] || item.shopType,
  },
  {
    header: t('download.storeType'),
    dataKey: 'storeType',
    formatter: (item: Store) => storeTypeLabels[item.storeType] || item.storeType,
  },
  { header: t('download.zone'), dataKey: 'zoneName' },
  { header: t('download.status'), dataKey: 'status' },
  {
    header: t('download.published'),
    dataKey: 'isPublished',
    formatter: (item: Store) => (item.isPublished ? 'Yes' : 'No'),
  },
  {
    header: t('download.rating'),
    dataKey: 'rating',
    formatter: (item: Store) => item.rating.toFixed(1),
  },
];
