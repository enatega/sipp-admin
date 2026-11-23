'use client';

import { VendorGraphMeta, VendorGraphPoint, VendorGraphSeries } from '@/types';
import {
  CategoryScale,
  ChartData,
  ChartDataset,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { Line } from 'react-chartjs-2';
import DisplayError from '@/components/shared/DisplayError';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const COLORS: Record<string, { line: string; fill: string }> = {
  totalOrders: { line: '#3B82F6', fill: 'rgba(59,130,246,0.12)' },
  completedOrders: { line: '#10B981', fill: 'rgba(16,185,129,0.12)' },
  inProgressOrders: { line: '#F59E0B', fill: 'rgba(245,158,11,0.12)' },
  pendingOrders: { line: '#EF4444', fill: 'rgba(239,68,68,0.12)' },
};

const DEFAULT_COLOR = { line: '#6B7280', fill: 'rgba(107,114,128,0.12)' };

const getLabel = (t: string, granularity: string) => {
  if (granularity === 'year') {
    return t;
  }
  if (granularity === 'month') {
    const [y, m] = t.split('-').map(Number);
    return moment(new Date(y, m - 1, 1)).format('MMM');
  }
  if (granularity === 'week' || granularity === 'day') {
    return moment(t).format('MMM D');
  }
  return t;
};

interface RevenueChartDataset extends ChartDataset<'line', number[]> {
  unit: string;
}

function toChartData(
  series: VendorGraphSeries[],
  granularity: VendorGraphSeries['points'][0]['t'],
) {
  if (!series || series.length === 0 || !series[0].points) {
    return { labels: [], datasets: [] };
  }

  const labels = series[0].points.map((p: VendorGraphPoint) =>
    getLabel(p.t, granularity),
  );

  const datasets: RevenueChartDataset[] = series.map((s: VendorGraphSeries) => {
    const color = COLORS[s.key] || DEFAULT_COLOR;

    return {
      label: s.label,
      data: s.points.map((p: VendorGraphPoint) => p.v),
      borderColor: color.line,
      backgroundColor: color.fill,
      pointBackgroundColor: color.line,
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 2,
      tension: 0.4,
      fill: true,
      yAxisID: 'y',
      unit: s.unit,
    };
  });

  return { labels, datasets };
}

const OrderOverview = ({
  series,
  meta,
  isLoading,
  isError,
  errorMessage,
}: {
  series: VendorGraphSeries[];
  meta: VendorGraphMeta;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.revenueChart');
  const tError = useTranslations('vendorDeliveriesDashboard.errors');

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DisplayError
          title={tError('fetchOrderTrendFailedTitle')}
          message={errorMessage}
        />
      </div>
    );
  }

  const granularity = meta?.granularity || 'day';
  const { labels, datasets } = toChartData(series || [], granularity);

  const data: ChartData<'line'> = { labels, datasets };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        usePointStyle: true,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => items[0]?.label || '',
          label: (ctx: TooltipItem<'line'>) => {
            const y = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label}: ${Math.round(y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E5E7EB' },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
        },
      },
      x: {
        grid: { color: '#E5E7EB' },
        ticks: { color: '#6B7280', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-500">{t('description')}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <LegendDot
            color={COLORS.totalOrders.line}
            label={t('totalOrdersLabel')}
          />
          <LegendDot
            color={COLORS.completedOrders.line}
            label={t('completedOrdersLabel')}
          />
          <LegendDot
            color={COLORS.inProgressOrders.line}
            label={t('inProgressOrdersLabel')}
          />
          <LegendDot
            color={COLORS.pendingOrders.line}
            label={t('pendingOrdersLabel')}
          />
        </div>
      </div>

      <div className="h-[400px]">
        {series &&
        series.length > 0 &&
        series.some((s) => s.points.length > 0) ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

export default OrderOverview;
