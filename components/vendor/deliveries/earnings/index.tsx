'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import VendorEarningsStatsCards from './statsCards';
import VendorEarningsTable from './table';

const VendorEarnings = () => {
  const t = useTranslations('vendorEarnings.table');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Heading title={t('title')} />

      {/* Stats Cards */}
      <VendorEarningsStatsCards />

      {/* Earnings Table */}
      <VendorEarningsTable />
    </div>
  );
};

export default VendorEarnings;
