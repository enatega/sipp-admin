'use client';

import {
  EnategaDeliveriesDashboardTopStore,
  EnategaDeliveriesDashboardTopVendor,
  EnategaDeliveriesDashboardTopZone,
} from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import TopStoresTable from './TopStoresTable';
import TopVendorTable from './TopVendorTable';
import TopZoneTable from './TopZoneTable';

interface TopPerformerTablesProps {
  topVendors?: EnategaDeliveriesDashboardTopVendor[];
  topStores?: EnategaDeliveriesDashboardTopStore[];
  topZones?: EnategaDeliveriesDashboardTopZone[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function TopPerformerTables({
  topVendors,
  topStores,
  topZones,
  isLoading,
  isError,
  errorMessage,
}: TopPerformerTablesProps) {
  return (
    <div className="bg-white rounded-lg border p-4 sm:p-6">
      <div className="grid grid-cols-1  gap-4 lg:gap-6">
        <TopVendorTable
          data={topVendors}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
        <TopStoresTable
          data={topStores}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
        <TopZoneTable
          data={topZones}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
