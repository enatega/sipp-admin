export interface DeliveryStore extends Record<string, unknown> {
  id: string;
  storeimage: string;
  coverimage: string;
  address: string | null;
  deliverytime: string | null;
  minimumorder: string | null;
  salestax: string | null;
  totalorders: number;
  totalSales: string;
  storetype: string;
  status: string;
  vendorid: string;
  vendorname: string;
  storename: string;
  storeemail: string;
  isactive: boolean;
  isblocked: boolean;
  shoptypeid: string;
  shoptypename: string;
  zonename: string;
  isavailable: boolean;
  averagerating: string;
  reviewcount: string;
  activeorders: string;
  createdat: string;
  updatedat: string;
}
