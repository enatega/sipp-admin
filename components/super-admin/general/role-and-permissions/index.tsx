'use client';

import Header from './Header';
import RolesTable from './table';

export default function RoleAndPermissions() {
  return (
    <div className="space-y-4">
      <Header />
      <RolesTable />
    </div>
  );
}
