'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApiErrorResponse } from '@/types';
import { MoreVertical, PenIcon, TrashIcon, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { EnategaDeliveriesBanner } from '@/types/api/super-admin/enatega-deliveries/banners.api';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteBanner,
  useGetBanners,
} from '@/hooks/api/super-admin/enatega-deliveries/banners';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';

const EditBannerSheet = dynamic(
  () => import('./EditBannerSheet').then((mod) => mod.EditBannerSheet),
  { ssr: false },
);
const AppAlertDialog = dynamic(
  () =>
    import('@/components/shared/AppAlertDialog').then(
      (mod) => mod.AppAlertDialog,
    ),
  { ssr: false },
);

const limit: TLimitType = 10;

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const formatCreatedAt = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return CREATED_AT_FORMATTER.format(date)
    .replace(',', '')
    .replace('AM', 'am')
    .replace('PM', 'pm');
};

const getActionTypeLabel = (value?: string) =>
  (value || 'none')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getRelatedEntity = (banner: EnategaDeliveriesBanner) => {
  if (banner.actionType === 'store') {
    return (
      banner.store?.name ||
      banner.store?.address ||
      banner.relatedStore ||
      'N/A'
    );
  }

  if (banner.actionType === 'product') {
    return banner.product?.name || banner.relatedProduct || 'N/A';
  }

  if (banner.actionType === 'shop_type') {
    return banner.shopType?.name || banner.relatedShopType || 'N/A';
  }

  return 'N/A';
};

export function BannerTable() {
  const t = useTranslations('enategaDeliveriesPages.banners');
  const { data, isLoading, isError, error } = useGetBanners();
  const deleteBannerMutation = useDeleteBanner();
  const [deleteBanner, setDeleteBanner] =
    useState<EnategaDeliveriesBanner | null>(null);
  const [editBanner, setEditBanner] = useState<EnategaDeliveriesBanner | null>(
    null,
  );

  const banners = data?.data ?? [];

  const {
    items: sortedBanners,
    requestSort,
    sortConfig,
  } = useSortableData<EnategaDeliveriesBanner>(banners);

  const handleDeleteBanner = async () => {
    try {
      if (!deleteBanner) return;

      await deleteBannerMutation.mutateAsync(deleteBanner.id);
      setDeleteBanner(null);
      toast.success(t('messages.deleteSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead className="pl-2">{t('table.media')}</TableHead>
            <TableHeaderCell
              label={t('table.title')}
              sortKey="title"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHeaderCell
              label={t('table.description')}
              sortKey="description"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHeaderCell
              label={t('table.actionType')}
              sortKey="actionType"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHead className="pl-2">{t('table.relatedTo')}</TableHead>
            <TableHeaderCell
              label={t('table.createdAt')}
              sortKey="createdAt"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHead className="pl-2">{t('table.action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableShimmer limit={limit} columns={7} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <DisplayError
                  title={t('messages.fetchError')}
                  message={returnErrorMessage(error as ApiErrorResponse)}
                />
              </TableCell>
            </TableRow>
          ) : sortedBanners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                <NoDataFound title={t('messages.noData')} />
              </TableCell>
            </TableRow>
          ) : (
            sortedBanners.map((item, index) => (
              <TableRow key={item.id ?? index} className="h-[55px]!">
                <TableCell>
                  {item.bannerImageLink ? (
                    <Avatar>
                      <AvatarImage src={item.bannerImageLink} />
                      <AvatarFallback>
                        {item?.title?.slice(0, 1) || 'N/A'}
                      </AvatarFallback>
                    </Avatar>
                  ) : item.bannerVideoLink ? (
                    <div className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      <Video className="size-3.5" />
                      Video
                    </div>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>{item?.title || 'N/A'}</TableCell>
                <TableCell>
                  <TooltipText
                    content={item?.description || 'N/A'}
                    align="start"
                  >
                    <span className="line-clamp-2">
                      {item?.description || 'N/A'}
                    </span>
                  </TooltipText>
                </TableCell>
                <TableCell>{getActionTypeLabel(item?.actionType)}</TableCell>
                <TableCell>
                  <TooltipText content={getRelatedEntity(item)} align="start">
                    <span className="line-clamp-2">
                      {getRelatedEntity(item)}
                    </span>
                  </TooltipText>
                </TableCell>
                <TableCell>
                  {formatCreatedAt(item.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                      <MoreVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                        onClick={() => setEditBanner(item)}
                      >
                        <PenIcon className="size-[18px]" />
                        <span className="text-sm">{t('editButton')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
                        onClick={() => setDeleteBanner(item)}
                      >
                        <TrashIcon className="size-[18px] text-help-red" />
                        <span className="text-sm text-help-red">
                          {t('deleteButton')}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="p-3 bg-accent/30 border-t rounded-b-md">
        {sortedBanners.length > 0 && (
          <AppPagination
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            totalData={data?.total || sortedBanners.length}
            defaultLimit={(data?.limit as TLimitType) || 10}
          />
        )}
      </div>

      {editBanner ? (
        <EditBannerSheet
          open={!!editBanner}
          onOpenChange={() => setEditBanner(null)}
          bannerData={editBanner}
        />
      ) : null}

      {deleteBanner ? (
        <AppAlertDialog
          title={t('deleteTitle')}
          subTitle={t('deleteSubtitle')}
          description={t('deleteDescription')}
          confirmLabel={t('deleteConfirm')}
          open={!!deleteBanner}
          onConfirm={handleDeleteBanner}
          variant="delete"
          onOpenChange={() => setDeleteBanner(null)}
          loading={deleteBannerMutation.isPending}
        />
      ) : null}
    </div>
  );
}
