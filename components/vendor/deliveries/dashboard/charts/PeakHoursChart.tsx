'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  ScriptableContext,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DisplayError from '@/components/shared/DisplayError';
import { Skeleton } from '@/components/ui/skeleton';
import { IVendorPeakHoursChart } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const VendorPeakHoursChart: React.FC<IVendorPeakHoursChart> = ({
  data,
  isLoading,
  isError,
  errorMessage,
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.peakHoursChart');
  const tTooltip = useTranslations(
    'vendorDeliveriesDashboard.peakHoursChart.tooltip',
  );
  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.map((d) => d.hour),
      datasets: [
        {
          label: t('ordersLabel'),
          data: data.map((d) => d.orders),
          backgroundColor: (context: ScriptableContext<'bar'>) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.6)';
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top,
            );
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');
            return gradient;
          },
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1.5,
          borderRadius: 6,
          maxBarThickness: 32,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
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
          padding: 12,
          displayColors: false,
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            title: (items) =>
              tTooltip('time', {
                time: items[0].label,
              }),
            label: (context: TooltipItem<'bar'>) => {
              const val = context.parsed.y ?? 0;
              return val === 1
                ? tTooltip('singleOrder')
                : tTooltip('multipleOrders', {
                    count: val.toLocaleString(),
                  });
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
            color: '#9CA3AF',
            font: {
              size: 10,
              weight: 500,
            },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [4, 4],
            color: 'rgba(156, 163, 175, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: '#9CA3AF',
            padding: 10,
            font: {
              size: 11,
            },
            precision: 0,
          },
        },
      },
      layout: {
        padding: {
          top: 10,
        },
      },
    }),
    [tTooltip],
  );

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md col-span-2">
        <DisplayError
          title={t('fetchFailedTitle')}
          message={errorMessage}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md col-span-2">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
          {t('title')}
        </h3>
        <p className="text-sm text-gray-500 ">
          {t('description')}
        </p>
      </div>

      <div className="relative h-[280px]">
        {data && data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-xl font-bold">!</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              {t('noData')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPeakHoursChart;
