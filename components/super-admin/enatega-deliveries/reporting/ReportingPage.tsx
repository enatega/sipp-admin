'use client';

import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { Tabs } from '@/components/ui/tabs';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
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
        <p className="text-sm font-medium text-primary">{t('title')}</p>
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
          key={activeReport.key}
          reportKey={activeReport.key as TaxCommissionReportKey}
        />
      ) : null}
      <ReportTable key={activeReport.key} report={activeReport} />
    </main>
  );
}
