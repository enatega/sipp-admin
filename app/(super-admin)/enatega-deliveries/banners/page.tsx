import { BannerTable } from '@/components/super-admin/enatega-deliveries/banners/main/BannerTable';
import { Filters } from '@/components/super-admin/enatega-deliveries/banners/main/Filters';
import { Header } from '@/components/super-admin/enatega-deliveries/banners/main/Header';

function page() {
  return (
    <div className="space-y-5">
      <Header />
      <Filters />
      <BannerTable />
    </div>
  );
}

export default page;
