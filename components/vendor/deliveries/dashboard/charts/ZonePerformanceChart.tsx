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
import { useTranslations } from 'next-intl';
import { Bar } from 'react-chartjs-2';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { IVendorZonePerformanceChart } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Eye-catching gradient colors for zone performance
const ZONE_COLORS = [
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#22C55E', // Green
  '#3B82F6', // Blue
];

const VendorZonePerformanceChart: React.FC<IVendorZonePerformanceChart> = ({
  data,
  isLoading,
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.zonePerformanceChart');
  const { currencySymbol } = useCurrency();

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.map((d) => d.zoneName),
      datasets: [
        {
          label: t('earningsLabel'),
          data: data.map((d) => d.deliveryRevenue),
          backgroundColor: data.map(
            (_, index) => ZONE_COLORS[index % ZONE_COLORS.length],
          ),
          borderRadius: 8,
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
                `${t('zoneLabel')}: ${zoneData.zoneName}`,
                `${t('totalDeliveries')}: ${zoneData.deliveryCount.toLocaleString()}`,
                `${t('totalRevenue')}: ${currencySymbol} ${zoneData.deliveryRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
            ? Math.max(...data.map((d) => d.deliveryRevenue)) * 1.12
            : 0,
          grid: {
            borderDash: [6, 6],
            color: 'rgba(156,163,175,0.15)',
            drawBorder: false,
          },
          ticks: {
            callback: function (value) {
              const v = Number(value);
              if (v >= 1000) {
                return `${(v / 1000).toFixed(0)}k`;
              }
              return v.toString();
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
    [data, t, currencySymbol],
  );

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
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

export default VendorZonePerformanceChart;
