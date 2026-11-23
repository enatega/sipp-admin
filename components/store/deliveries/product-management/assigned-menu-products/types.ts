export type AssignedMenuProduct = {
  id: string;
  menuId: string;
  menuName: string;
  name: string;
  category: string;
  price: number;
  addon: string;
  unitOfMeasure: string;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
};

export type MenuCard = {
  id: string;
  name: string;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
};
