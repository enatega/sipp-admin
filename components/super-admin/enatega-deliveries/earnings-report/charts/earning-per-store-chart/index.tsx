'use client';

import React, { useMemo } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { StoreTypeEarning } from '@/types/entities/super-admin/enatega-deliveries/earning-report';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface IEarningsPerStore {
  data?: StoreTypeEarning[];
  isLoading: boolean;
}

export const EarningsPerStoreTypeChart: React.FC<IEarningsPerStore> = ({
  data,
  isLoading,
}) => {
  const t = useTranslations('lumiFood.earningsReports.charts.earningsPerStore');
  const tTooltip = useTranslations(
    'lumiFood.earningsReports.charts.earningsPerStore.tooltip',
  );
  const { currencySymbol } = useCurrency();

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.map((d) => d.name),
      datasets: [
        {
          label: t('earningsLabel'),
          data: data.map((d) => d.revenue),
          backgroundColor: '#243BDB',
          borderRadius: 6,
          maxBarThickness: 46,
        },
      ],
    };
  }, [data, t]);

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#111827',
          titleColor: '#FFFFFF',
          bodyColor: '#F9FAFB',
          padding: 10,
          displayColors: false,
          borderColor: '#374151',
          borderWidth: 1,
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'bar'>) => {
              const idx = context.dataIndex ?? 0;
              if (!data) return '';
              const zoneData = data[idx];
              if (!zoneData) return '';

              return [
                `${tTooltip('totalOrders')} \t${zoneData.orders.toLocaleString()}`,
                `${tTooltip('totalRevenue')} \t${currencySymbol} ${zoneData.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 13,
            },
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: data
            ? Math.max(...data.map((d) => d.revenue)) * 1.12
            : 0,
          grid: {
            borderDash: [6, 6],
            color: 'rgba(156,163,175,0.15)',
            drawBorder: false,
          },
          ticks: {
            callback: function (value) {
              const n = Number(value);
              if (n >= 1_000_000_000)
                return `${(n / 1_000_000_000).toFixed(1)} B`;
              if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
              if (n >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
              return `${n}`;
            },
            color: '#6B7280',
            padding: 8,
            font: {
              size: 13,
            },
          },
        },
      },
      layout: {
        padding: {
          top: 6,
          bottom: 6,
        },
      },
    }),
    [data, currencySymbol, tTooltip],
  );

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('title')}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {t('description')}
        </p>
      </div>

      <div className="relative h-[360px]">
        {data && data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
