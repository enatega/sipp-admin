export type StoreOption = {
  id: string;
  label: string;
  description?: string;
};

export const STORE_OPTIONS: StoreOption[] = [
  { id: 'store-1', label: 'Store 1' },
  { id: 'store-2', label: 'Store 2' },
  { id: 'store-3', label: 'Store 3' },
  { id: 'store-4', label: 'Store 4' },
  { id: 'store-5', label: 'Store 5' },
];

export type AddMenuFormValues = {
  title: string;
  description: string;
  stores: string[];
  image: File | null;
  isAvailable: boolean;
};

export const INITIAL_ADD_MENU_VALUES: AddMenuFormValues = {
  title: '',
  description: '',
  stores: [],
  image: null,
  isAvailable: true,
};
