
import { Suspense } from 'react';
import Header from '@/components/super-admin/general/notifications/Header';
import NotificationsTable from '@/components/super-admin/general/notifications/table';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-4">
        <Header />
        <div>
          <NotificationsTable />
        </div>
      </div>
    </Suspense>
  );
}
