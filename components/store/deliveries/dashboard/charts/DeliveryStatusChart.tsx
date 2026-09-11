'use client';

import React, { useMemo } from 'react';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { useTranslations } from 'next-intl';
import { Pie } from 'react-chartjs-2';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { IStoreDeliveryStatusChart } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

const CUSTOMER_GROWTH_COLORS = ['#22C55E', '#6366F1', '#F97316', '#EC4899'];

const StoreDeliveryStatusChart: React.FC<IStoreDeliveryStatusChart> = ({
  data,
  isLoading,
}) => {
  const t = useTranslations('storeDeliveriesDashboard.deliveryStatusChart');
  const { currencySymbol } = useCurrency();
  const chartItems = useMemo(() => data?.chart ?? [], [data]);

  const chartData = useMemo(() => {
    if (!chartItems.length) return { labels: [], datasets: [] };
    return {
      labels: chartItems.map((d) => d.type),
      datasets: [
        {
          data: chartItems.map((d) => parseFloat(d.percentage.toString())),
          backgroundColor: chartItems.map(
            (_, index) => CUSTOMER_GROWTH_COLORS[index % CUSTOMER_GROWTH_COLORS.length],
          ),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [chartItems]);

  const options = useMemo<ChartOptions<'pie'>>(() => {
    if (!chartItems.length) return {};
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#111827',
          titleColor: '#fff',
          bodyColor: '#F9FAFB',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'pie'>) => {
              const idx = context.dataIndex ?? 0;
              const growthItem = chartItems[idx];
              if (!growthItem) return '';

              return [
                `${growthItem.type}: ${growthItem.percentage}%`,
                `${t('countLabel')}: ${growthItem.value.toLocaleString()}`,
              ];
            },
          },
        },
      },
    };
  }, [chartItems, t]);

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  const legendItems = chartItems.map((item, index) => ({
    label: item.type,
    color: CUSTOMER_GROWTH_COLORS[index % CUSTOMER_GROWTH_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{t('title')}</h3>
        <p className="text-sm text-gray-500">{t('description')}</p>
        {data && (
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            <p>
              {t('totalSalesLabel')}: {data.totalSales.toLocaleString()}
            </p>
            <p>
              {t('totalRevenueLabel')}: {currencySymbol}{' '}
              {data.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      <div className="relative h-[320px] mb-6">
        {chartItems.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        )}
      </div>

      <div className="flex gap-6 items-center flex-wrap">
        {legendItems.map((it, idx) => (
          <div className="flex items-center gap-2" key={idx}>
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: it.color }}
            />
            <span className="text-sm text-gray-600 capitalize">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreDeliveryStatusChart;
