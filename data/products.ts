export interface Product {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  addon?: string;
  unitOfMeasure?: string;
  stockAvailability: 'in_stock' | 'out_of_stock';
  status: 'active' | 'inactive';
  stockQuantity: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown; // Index signature for DownloadButtons
}

export interface ProductFormData {
  name: string;
  image?: File | string;
  categoryId: string;
  price: number;
  addon?: string;
  unitOfMeasure?: string;
  stockAvailability?: 'in_stock' | 'out_of_stock';
  stockQuantity?: number;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

// Dummy categories for the category dropdown
export const dummyCategories = [
  { id: '1', name: 'Burgers' },
  { id: '2', name: 'Pizza' },
  { id: '3', name: 'Salads' },
  { id: '4', name: 'Drinks' },
  { id: '5', name: 'Desserts' },
  { id: '6', name: 'Sandwiches' },
  { id: '7', name: 'Pasta' },
  { id: '8', name: 'Seafood' },
];

// Helper function to get category name by id
export const getCategoryName = (categoryId: string): string => {
  const category = dummyCategories.find((c) => c.id === categoryId);
  return category?.name || 'Unknown';
};

export const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Chicken Burger',
    image: '',
    categoryId: '1',
    categoryName: 'Fast Food',
    price: 550,
    addon: 'Extra Cheese',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 120,
    description: 'Juicy chicken patty with fresh vegetables',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Beef Burger',
    image: '',
    categoryId: '1',
    categoryName: 'Fast Food',
    price: 650,
    addon: 'Bacon',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 85,
    description: 'Classic beef patty with melted cheese',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    image: '',
    categoryId: '2',
    categoryName: 'Pizza',
    price: 1200,
    addon: 'Extra Toppings',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'out_of_stock',
    status: 'active',
    stockQuantity: 0,
    description: 'Traditional Italian pizza',
    createdAt: '2024-01-17T12:15:00Z',
    updatedAt: '2024-01-17T12:15:00Z',
  },
  {
    id: '4',
    name: 'Chicken Tikka Pizza',
    image: '',
    categoryId: '2',
    categoryName: 'Pizza',
    price: 1500,
    addon: 'None',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 45,
    description: 'Spicy chicken tikka pizza',
    createdAt: '2024-01-18T13:30:00Z',
    updatedAt: '2024-01-18T13:30:00Z',
  },
  {
    id: '5',
    name: 'Caesar Salad',
    image: '',
    categoryId: '3',
    categoryName: 'Salads',
    price: 450,
    addon: 'Extra Chicken',
    unitOfMeasure: 'Per Bowl',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 60,
    description: 'Fresh romaine lettuce with caesar dressing',
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
  },
  {
    id: '6',
    name: 'Greek Salad',
    image: '',
    categoryId: '3',
    categoryName: 'Salads',
    price: 500,
    addon: 'Feta Cheese',
    unitOfMeasure: 'Per Bowl',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 35,
    description: 'Mediterranean style salad',
    createdAt: '2024-01-20T15:45:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
  },
  {
    id: '7',
    name: 'Cold Coffee',
    image: '',
    categoryId: '4',
    categoryName: 'Drinks',
    price: 250,
    addon: 'Extra Shot',
    unitOfMeasure: 'Per Glass',
    stockAvailability: 'out_of_stock',
    status: 'inactive',
    stockQuantity: 0,
    description: 'Iced coffee with milk',
    createdAt: '2024-01-21T16:20:00Z',
    updatedAt: '2024-01-21T16:20:00Z',
  },
  {
    id: '8',
    name: 'Fresh Lemonade',
    image: '',
    categoryId: '4',
    categoryName: 'Drinks',
    price: 180,
    addon: 'Mint Leaves',
    unitOfMeasure: 'Per Glass',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 100,
    description: 'Refreshing lemon drink',
    createdAt: '2024-01-22T17:10:00Z',
    updatedAt: '2024-01-22T17:10:00Z',
  },
  {
    id: '9',
    name: 'Chocolate Cake',
    image: '',
    categoryId: '5',
    categoryName: 'Desserts',
    price: 350,
    addon: 'Ice Cream',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 25,
    description: 'Rich chocolate layer cake',
    createdAt: '2024-01-23T18:00:00Z',
    updatedAt: '2024-01-23T18:00:00Z',
  },
  {
    id: '10',
    name: 'Tiramisu',
    image: '',
    categoryId: '5',
    categoryName: 'Desserts',
    price: 400,
    addon: 'None',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'out_of_stock',
    status: 'active',
    stockQuantity: 0,
    description: 'Italian coffee-flavored dessert',
    createdAt: '2024-01-24T19:30:00Z',
    updatedAt: '2024-01-24T19:30:00Z',
  },
  {
    id: '11',
    name: 'Chicken Wings',
    image: '',
    categoryId: '6',
    categoryName: 'Appetizers',
    price: 550,
    addon: 'Extra Sauce',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 80,
    description: 'Crispy fried chicken wings',
    createdAt: '2024-01-25T20:15:00Z',
    updatedAt: '2024-01-25T20:15:00Z',
  },
  {
    id: '12',
    name: 'Garlic Bread',
    image: '',
    categoryId: '6',
    categoryName: 'Appetizers',
    price: 300,
    addon: 'Cheese',
    unitOfMeasure: 'Per Piece',
    stockAvailability: 'in_stock',
    status: 'active',
    stockQuantity: 50,
    description: 'Toasted bread with garlic butter',
    createdAt: '2024-01-26T21:00:00Z',
    updatedAt: '2024-01-26T21:00:00Z',
  },
];

// Simulate API response structure
export interface GetProductsResponse {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Simulate API hook parameters
export interface GetProductsQueryParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  categoryId?: string;
}
