'use client';

import { useEffect } from 'react';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { Tabs } from '@/components/ui/tabs';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { useQueryParams } from '@/hooks/use-query-params';
import type { TaxCommissionReportKey } from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';
import { useTranslations } from 'next-intl';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';
import { REPORT_PAGE_CONFIGS, type ReportPageName } from './report-config';
import { SalesSummary } from './SalesSummary';
import { TaxCommissionSummary } from './TaxCommissionSummary';

export function ReportingPage({ page }: { page: ReportPageName }) {
  const config = REPORT_PAGE_CONFIGS[page];
  const t = useTranslations('reporting');
  const tPages = useTranslations('reporting.pages');
  const tTabs = useTranslations('reporting.tabs');
  const { getParam, setParams } = useQueryParams();
  useEffect(() => {
    if (page !== 'serviceFees' || getParam('dateFrom') || getParam('dateTo')) return;
    const dateParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(new Date());
    const year = Number(dateParts.find((part) => part.type === 'year')?.value);
    const month = Number(dateParts.find((part) => part.type === 'month')?.value);
    const monthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthString = String(month).padStart(2, '0');
    setParams({
      dateFrom: `${year}-${monthString}-01`,
      dateTo: `${year}-${monthString}-${String(monthEnd).padStart(2, '0')}`,
      page: '1',
    });
  }, [getParam, page, setParams]);
  const tabDefinitions: TabDef[] = config.tabs.map((tab) => ({
    value: tab.key,
    label: tTabs(`${tab.key.replace('/', '_')}.label`),
  }));
  const { active, setActive, tabs } = useSyncedTab(tabDefinitions, {
    mode: 'url-only',
    paramName: 'view',
    syncParamsOnChange: { page: '1' },
  });
  const activeReport = config.tabs.find((tab) => tab.key === active) ?? config.tabs[0];

  return (
    <main className="space-y-5 pb-8">
      <header>
        <p className="text-sm font-medium text-ink">{t('title')}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {tPages(`${page}.title`)}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {tPages(`${page}.description`)}
        </p>
      </header>

      <ReportFilters />
      {config.showSalesSummary ? <SalesSummary /> : null}

      {tabs.length > 1 ? (
        <Tabs value={active} onValueChange={setActive}>
          <ScrollableTabsNav tabs={tabs} value={active} onChange={setActive} />
        </Tabs>
      ) : null}
      {page === 'taxCommission' ? (
        <TaxCommissionSummary
          key={`summary-${activeReport.key}`}
          reportKey={activeReport.key as TaxCommissionReportKey}
        />
      ) : null}
      <ReportTable key={`table-${activeReport.key}`}report={activeReport} />
    </main>
  );
}
