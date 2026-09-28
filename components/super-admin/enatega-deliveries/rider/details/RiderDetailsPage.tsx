'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  CarFront,
  Filter,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Wallet,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import type { DateRange } from 'react-day-picker';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  fetchRiderDeliveredOrders,
  useGetDeliveryRider,
  useGetRiderDeliveredOrders,
} from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppButton } from '@/components/shared/AppButton';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';

export function RiderDetailsPage({ riderId }: { riderId: string }) {
  const t = useTranslations('driverManagement.driversTable');
  const tHeaders = useTranslations(
    'driverManagement.driversTable.tableHeaders',
  );
  const router = useRouter();
  const pathname = usePathname();
  const { getParam, setParams } = useQueryParams();
  const { currencySymbol } = useCurrency();
  const currency = resolveCurrencySymbol(currencySymbol);
  const { data, isLoading, isError, error } = useGetDeliveryRider(riderId);

  const appliedStartDate = getParam('riderStartDate') || undefined;
  const appliedEndDate = getParam('riderEndDate') || undefined;
  const page = Math.max(1, Number(getParam('riderPage')) || 1);
  const limit = [10, 25, 50, 100].includes(Number(getParam('riderLimit')))
    ? Number(getParam('riderLimit'))
    : 10;
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(
    appliedStartDate && appliedEndDate
      ? {
          from: parseISO(appliedStartDate),
          to: parseISO(appliedEndDate),
        }
      : undefined,
  );

  useEffect(() => {
    setDraftDateRange(
      appliedStartDate && appliedEndDate
        ? {
            from: parseISO(appliedStartDate),
            to: parseISO(appliedEndDate),
          }
        : undefined,
    );
  }, [appliedEndDate, appliedStartDate]);

  const orderQueryParams = useMemo(
    () => ({
      page,
      limit,
      startDate: appliedStartDate,
      endDate: appliedEndDate,
    }),
    [appliedEndDate, appliedStartDate, limit, page],
  );
  const {
    data: deliveredOrdersData,
    isLoading: deliveredOrdersLoading,
    isFetching: deliveredOrdersFetching,
    isError: deliveredOrdersError,
    error: deliveredOrdersRequestError,
  } = useGetRiderDeliveredOrders(riderId, orderQueryParams);

  const rider = data?.rider;
  const user = rider?.userProfile?.user;
  const vehicle = rider?.vehicle;
  const deliveredOrders = deliveredOrdersData?.data ?? [];
  const hasAppliedDateFilter = Boolean(appliedStartDate && appliedEndDate);
  const draftRangeComplete = Boolean(
    draftDateRange?.from && draftDateRange?.to,
  );
  const draftStartDate = draftDateRange?.from
    ? format(draftDateRange.from, 'yyyy-MM-dd')
    : undefined;
  const draftEndDate = draftDateRange?.to
    ? format(draftDateRange.to, 'yyyy-MM-dd')
    : undefined;
  const filterHasChanges =
    draftStartDate !== appliedStartDate || draftEndDate !== appliedEndDate;

  const applyDateFilter = () => {
    if (!draftStartDate || !draftEndDate) return;
    setParams({
      riderStartDate: draftStartDate,
      riderEndDate: draftEndDate,
      riderPage: '1',
    });
  };

  const clearDateFilter = () => {
    setDraftDateRange(undefined);
    setParams({
      riderStartDate: null,
      riderEndDate: null,
      riderPage: '1',
    });
  };

  const fetchAllDeliveredOrders = useCallback(async () => {
    const exportLimit = 100;
    const firstPage = await fetchRiderDeliveredOrders(riderId, {
      page: 1,
      limit: exportLimit,
      startDate: appliedStartDate,
      endDate: appliedEndDate,
    });
    const allRows = [...firstPage.data];

    for (
      let exportPage = 2;
      exportPage <= firstPage.totalPages;
      exportPage += 1
    ) {
      const nextPage = await fetchRiderDeliveredOrders(riderId, {
        page: exportPage,
        limit: exportLimit,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
      });
      allRows.push(...nextPage.data);
    }

    return allRows;
  }, [appliedEndDate, appliedStartDate, riderId]);

  const navigate = (suffix: string) =>
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/riders/${riderId}${suffix}`,
      ),
    );

  if (isLoading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-xl border bg-muted" />
        <div className="h-80 animate-pulse rounded-xl border bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <DisplayError
        title={t('failedToFetchRiderDetails')}
        message={returnErrorMessage(error as ApiErrorResponse)}
      />
    );
  }

  if (!rider) return <NoDataFound title={t('riderDetailsNotFound')} />;

  const stats = [
    {
      label: tHeaders('totalDeliveries'),
      value: deliveredOrdersData?.total ?? 0,
    },
    {
      label: tHeaders('totalEarnings'),
      value: formatCurrency(deliveredOrdersData?.totalEarnings ?? 0, currency),
    },
    { label: t('ratings'), value: Number(data.averageRatings ?? 0).toFixed(1) },
    { label: t('reviewsCount'), value: data.noOfReviews ?? 0 },
  ];

  const downloadColumns = [
    { header: t('orderIdLabel'), dataKey: 'orderId' },
    { header: t('customerLabel'), dataKey: 'customerName' },
    { header: t('storeLabel'), dataKey: 'storeName' },
    {
      header: t('orderAmountLabel'),
      dataKey: 'orderAmount',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        formatCurrency(order.orderAmount, currency),
    },
    {
      header: t('deliveryFeeLabel'),
      dataKey: 'deliveryFee',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        formatCurrency(order.deliveryFee, currency),
    },
    {
      header: t('riderTipLabel'),
      dataKey: 'riderTip',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        formatCurrency(order.riderTip, currency),
    },
    {
      header: t('riderIncomeLabel'),
      dataKey: 'riderIncome',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        formatCurrency(order.riderIncome, currency),
    },
    {
      header: t('sippDeliveryCommissionLabel'),
      dataKey: 'sippDeliveryCommission',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        formatCurrency(order.sippDeliveryCommission, currency),
    },
    {
      header: t('deliveredAtLabel'),
      dataKey: 'deliveredAt',
      formatter: (order: (typeof deliveredOrders)[number]) =>
        moment(order.deliveredAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AppButton
            variant="secondary"
            size="sm"
            className="h-10 w-10 p-0"
            aria-label={t('backToRiders')}
            onClick={() =>
              router.push(
                buildScopedDeliveriesAdminPathFromCurrent(
                  pathname,
                  '/enatega-deliveries/riders',
                ),
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </AppButton>
          <div>
            <h1 className="text-2xl font-semibold">
              {user?.name || t('notAvailable')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('riderProfileAndOrders')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton variant="secondary" onClick={() => navigate('/wallet')}>
            <Wallet className="mr-2 h-4 w-4" />
            {t('walletAction')}
          </AppButton>
          <AppButton
            onClick={() =>
              router.push(
                buildScopedDeliveriesAdminPathFromCurrent(
                  pathname,
                  `/enatega-deliveries/riders/edit-rider/${riderId}`,
                ),
              )
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t('editAction')}
          </AppButton>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="space-y-3">
            <Status status={rider.status?.toLowerCase() || 'pending'} />
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user?.email || t('notAvailable')}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user?.phone || t('notAvailable')}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {rider.zone?.title || t('notAvailable')}
              </p>
              <p className="flex items-center gap-2">
                <CarFront className="h-4 w-4 text-muted-foreground" />
                {vehicle?.vehicleType?.name ||
                  vehicle?.vehicle_name ||
                  t('notAvailable')}
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 lg:max-w-2xl lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border bg-muted/20 p-3"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">{t('riderInformation')}</h2>
        <div className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Detail label={t('licenseNumberLabel')} value={rider.licenseNumber} />
          <Detail label={t('vehicleNumberLabel')} value={vehicle?.vehicle_no} />
          <Detail
            label={t('vehicleColorLabel')}
            value={vehicle?.vehicle_colour}
          />
          <Detail label={t('modelYearLabel')} value={vehicle?.model_year} />
          <Detail
            label={t('availabilityLabel')}
            value={rider.availabilityStatus}
          />
          <Detail
            label={t('registrationLabel')}
            value={
              rider.created_at
                ? moment(rider.created_at).format('DD MMM YYYY, hh:mm A')
                : undefined
            }
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {t('deliveredOrdersTitle')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('deliveredOrdersSubtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <DateRangePicker
              placeholder={t('filterByDeliveryDate')}
              date={draftDateRange}
              onDateChange={setDraftDateRange}
              className="min-w-[250px]"
            />
            {draftDateRange && (
              <AppButton
                variant="secondary"
                disabled={!draftRangeComplete || !filterHasChanges}
                onClick={applyDateFilter}
              >
                <Filter className="mr-2 h-4 w-4" />
                {t('applyDateFilter')}
              </AppButton>
            )}
            {(hasAppliedDateFilter || draftDateRange) && (
              <AppButton variant="mute" onClick={clearDateFilter}>
                {t('clearDateFilter')}
              </AppButton>
            )}
            <DownloadButtons
              fileName={`rider_earnings_${riderId}`}
              data={deliveredOrders}
              columns={downloadColumns}
              formats={['pdf', 'excel']}
              fetchAll={fetchAllDeliveredOrders}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[1050px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>{t('orderIdLabel')}</TableHead>
                <TableHead>{t('customerLabel')}</TableHead>
                <TableHead>{t('storeLabel')}</TableHead>
                <TableHead>{t('orderAmountLabel')}</TableHead>
                <TableHead>{t('deliveryFeeLabel')}</TableHead>
                <TableHead>{t('riderTipLabel')}</TableHead>
                <TableHead>{t('riderIncomeLabel')}</TableHead>
                <TableHead>{t('sippDeliveryCommissionLabel')}</TableHead>
                <TableHead>{t('deliveredAtLabel')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveredOrdersLoading || deliveredOrdersFetching ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    {t('loadingDeliveredOrders')}
                  </TableCell>
                </TableRow>
              ) : deliveredOrdersError ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <DisplayError
                      title={t('failedToFetchDeliveredOrders')}
                      message={returnErrorMessage(
                        deliveredOrdersRequestError as ApiErrorResponse,
                      )}
                    />
                  </TableCell>
                </TableRow>
              ) : deliveredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <NoDataFound title={t('noDeliveredOrders')} />
                  </TableCell>
                </TableRow>
              ) : (
                deliveredOrders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        buildScopedDeliveriesAdminPathFromCurrent(
                          pathname,
                          `/enatega-deliveries/orders/${order.orderId}`,
                        ),
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {order.orderId.slice(0, 10)}…
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.storeName}</TableCell>
                    <TableCell>
                      {formatCurrency(order.orderAmount, currency)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.deliveryFee, currency)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.riderTip, currency)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.riderIncome, currency)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(order.sippDeliveryCommission, currency)}
                    </TableCell>
                    <TableCell>
                      {moment(order.deliveredAt).format('DD MMM YYYY, hh:mm A')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {deliveredOrdersData && deliveredOrdersData.total > 0 && (
          <div className="border-t bg-muted/20 p-3">
            <AppPagination
              page={deliveredOrdersData.page}
              defaultLimit={limit as 10 | 25 | 50 | 100}
              totalData={deliveredOrdersData.total}
              totalPages={Math.max(1, deliveredOrdersData.totalPages)}
              onPageChange={(nextPage) =>
                setParams({ riderPage: String(nextPage) })
              }
              onLimitChange={(nextLimit) =>
                setParams({
                  riderLimit: String(nextLimit),
                  riderPage: '1',
                })
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize">
        {value == null || value === '' ? 'N/A' : String(value)}
      </p>
    </div>
  );
}
