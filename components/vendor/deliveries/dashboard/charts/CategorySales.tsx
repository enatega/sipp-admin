'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useCurrency } from '@/hooks/use-currency';
import DisplayError from '@/components/shared/DisplayError';
import { Skeleton } from '@/components/ui/skeleton';
import { IVendorDeliveryStatusChart } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = [
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#22C55E', // Green
  '#3B82F6', // Blue
];

const CategorySalesChart: React.FC<IVendorDeliveryStatusChart> = ({
  data,
  isLoading,
  isError,
  errorMessage,
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.categorySalesChart');
  const { currencySymbol } = useCurrency();

  const chartItems = useMemo(() => data?.chart ?? [], [data]);

  const chartData = useMemo(() => {
    if (!chartItems.length) return { labels: [], datasets: [] };
    return {
      labels: chartItems.map((d) => d.type),
      datasets: [
        {
          data: chartItems.map((d) => d.percentage),
          backgroundColor: chartItems.map(
            (_, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length],
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
              const item = chartItems[idx];
              if (!item) return '';

              return [
                `${item.type}: ${item.percentage}%`,
                `${t('revenueLabel')}: ${currencySymbol} ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              ];
            },
          },
        },
      },
    };
  }, [chartItems, currencySymbol, t]);

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-1">
        <DisplayError
          title={t('fetchFailedTitle')}
          message={errorMessage}
        />
      </div>
    );
  }

  const legendItems = chartItems.map((it, index) => ({
    label: it.type,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-1">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{t('title')}</h3>
        <p className="text-sm text-gray-500">
          {t('description')}
        </p>
        {data && (
          <p className="text-sm text-gray-500 mt-1">
            {t('totalSalesLabel')}: {currencySymbol}{' '}
            {data.totalSales.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
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
            <span className="text-sm text-gray-600 capitalize">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySalesChart;
