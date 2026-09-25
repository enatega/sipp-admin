'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import {
  ArrowLeft,
  CarFront,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Wallet,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetDeliveryRider } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useCurrency } from '@/hooks/use-currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';

export function RiderDetailsPage({ riderId }: { riderId: string }) {
  const t = useTranslations('driverManagement.driversTable');
  const tHeaders = useTranslations(
    'driverManagement.driversTable.tableHeaders',
  );
  const router = useRouter();
  const pathname = usePathname();
  const { currencySymbol } = useCurrency();
  const currency = resolveCurrencySymbol(currencySymbol);
  const { data, isLoading, isError, error } = useGetDeliveryRider(riderId);

  const rider = data?.rider;
  const user = rider?.userProfile?.user;
  const vehicle = rider?.vehicle;
  const deliveredOrders = data?.deliveredOrders ?? [];

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
    { label: tHeaders('totalDeliveries'), value: data.totalDeliveries ?? 0 },
    {
      label: tHeaders('totalEarnings'),
      value: formatCurrency(data.totalEarnings ?? 0, currency),
    },
    { label: t('ratings'), value: Number(data.averageRatings ?? 0).toFixed(1) },
    { label: t('reviewsCount'), value: data.noOfReviews ?? 0 },
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
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">{t('deliveredOrdersTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('deliveredOrdersSubtitle')}
          </p>
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
              {deliveredOrders.length === 0 ? (
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
