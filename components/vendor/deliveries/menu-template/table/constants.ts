import { VendorMenuTemplateItem } from './types';

const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1400&auto=format&fit=crop&q=80';

export const dummyMenuTemplates: VendorMenuTemplateItem[] = [
  {
    id: '1',
    name: 'Fast Food',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: DEFAULT_MENU_IMAGE,
    isActive: true,
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedStores: [
      {
        id: 'store-1',
        name: 'Store 1',
        address: 'Main Street',
        isActive: true,
        image: '',
      },
    ],
    totalProducts: 12,
    availability: true,
  },
  {
    id: '2',
    name: 'Chinese Food',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    imageUrl: DEFAULT_MENU_IMAGE,
    isActive: true,
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedStores: [
      {
        id: 'store-2',
        name: 'Store 2',
        address: 'Market Road',
        isActive: true,
        image: '',
      },
    ],
    totalProducts: 8,
    availability: false,
  },
];
