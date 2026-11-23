import { Filters } from '@/components/super-admin/enatega-deliveries/shop-types/main/filter';
import { Header } from '@/components/super-admin/enatega-deliveries/shop-types/main/header';
import { ShopTypeTable } from '@/components/super-admin/enatega-deliveries/shop-types/main/table';

function Page() {
  return (
    <div className="space-y-3">
      <Header />
      <Filters />
      <ShopTypeTable />
    </div>
  );
}

export default Page;
