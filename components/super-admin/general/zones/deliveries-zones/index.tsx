'use client';

import Header from './Header';
import DeliveriesZonesTable from './table';

export default function DeliveriesZones() {
  return (
    <div className="rounded-md border bg-white p-4 space-y-4">
      <Header />
      <DeliveriesZonesTable />
    </div>
  );
}
