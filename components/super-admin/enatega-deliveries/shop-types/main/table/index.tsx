'use client';

import { useState } from 'react';
import { ApiErrorResponse, ShopType } from '@/types';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteShopType,
  useGetShopTypes,
  useUpdateShopTypeStatus,
} from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import { EditShopTypeDrawer } from '../../edit-shop-type';

export function ShopTypeTable() {
  const tTable = useTranslations('lumiFood.shopTypes.table');
  const tActions = useTranslations('lumiFood.shopTypes.actions');
  const tDialogs = useTranslations('lumiFood.shopTypes.dialogs.delete');
  const tToasts = useTranslations('lumiFood.shopTypes.toasts');
  const { getParam } = useQueryParams();
  const limit = (Number(getParam('limit')) || 10) as TLimitType;

  const [deletingShopType, setDeletingShopType] = useState<ShopType | null>(
    null,
  );
  const [editingShopType, setEditingShopType] = useState<ShopType | null>(null);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  // Fetch shop types with loading, error states
  const { data, isLoading, isError, error } = useGetShopTypes({
    placeholderData: (previousData) => previousData,
  });

  // Delete mutation
  const { mutateAsync: deleteShopType, isPending: isDeletingShopType } =
    useDeleteShopType();
  // Status update mutation
  const { mutateAsync: updateStatus } = useUpdateShopTypeStatus();

  const shopTypes = data?.data || [];
  const {
    items: sortedShops,
    requestSort,
    sortConfig,
  } = useSortableData<ShopType>(shopTypes);

  const handleDeleteShopType = async () => {
    if (!deletingShopType) return;
    try {
      await deleteShopType(deletingShopType.id);
      toast.success(tToasts('deleteSuccess'));
      setDeletingShopType(null);
    } catch (err) {
      handleApiError(err as ApiErrorResponse);
    }
  };

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead className="pl-2">{tTable('icon')}</TableHead>
            <TableHeaderCell
              label={tTable('name')}
              sortKey="name"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHeaderCell
              label={tTable('description')}
              sortKey="description"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-2"
            />
            <TableHead className="pl-2">{tTable('status')}</TableHead>
            <TableHead className="pl-2">{tTable('action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableShimmer limit={limit} columns={5} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <DisplayError
                  title={tTable('fetchFailedTitle')}
                  message={
                    returnErrorMessage(error as ApiErrorResponse) ||
                    tTable('fetchFailedMessage')
                  }
                />
              </TableCell>
            </TableRow>
          ) : sortedShops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <NoDataFound title={tTable('noDataTitle')} />
              </TableCell>
            </TableRow>
          ) : (
            sortedShops.map((item) => (
              <TableRow key={item.id} className="h-[55px]!">
                <TableCell>
                  <Avatar>
                    <AvatarImage src={item?.image || ''} />
                    <AvatarFallback>
                      {item?.name?.slice(0, 1) || tTable('notAvailable')}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{item?.name || tTable('notAvailable')}</TableCell>
                <TableCell>
                  <TooltipText
                    content={item?.description || tTable('notAvailable')}
                    align="start"
                  >
                    <span className="line-clamp-2">
                      {item?.description || tTable('notAvailable')}
                    </span>
                  </TooltipText>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item?.is_active ?? false}
                    disabled={updatingIds.includes(item.id)}
                    onCheckedChange={async () => {
                      const newStatus = !item.is_active;
                      setUpdatingIds((s) => [...s, item.id]);
                      try {
                        await updateStatus({
                          shopTypeId: item.id,
                          is_active: newStatus,
                        });
                        toast.success(
                          newStatus
                            ? tToasts('statusActive')
                            : tToasts('statusInactive'),
                        );
                      } catch (err) {
                        handleApiError(err as ApiErrorResponse);
                      } finally {
                        setUpdatingIds((s) => s.filter((id) => id !== item.id));
                      }
                    }}
                  />
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
                        onClick={() => setEditingShopType(item)}
                      >
                        <PenIcon className="size-[18px]" />
                        <span className="text-sm ">{tActions('edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
                        onClick={() => setDeletingShopType(item)}
                      >
                        <TrashIcon className="size-[18px] text-help-red" />
                        <span className="text-sm text-help-red">
                          {tActions('delete')}
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
        {!isLoading && !isError && sortedShops.length > 0 && (
          <AppPagination
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            totalData={data?.total || 0}
            defaultLimit={limit}
          />
        )}
      </div>

      {editingShopType && (
        <EditShopTypeDrawer
          isOpen={!!editingShopType}
          onClose={() => setEditingShopType(null)}
          shopTypeData={editingShopType}
        />
      )}

      {deletingShopType && (
        <AppAlertDialog
          title={tDialogs('title')}
          subTitle={tDialogs('subTitle')}
          description={tDialogs('description')}
          confirmLabel={tDialogs('confirm')}
          open={!!deletingShopType}
          onConfirm={handleDeleteShopType}
          variant="delete"
          onOpenChange={() => setDeletingShopType(null)}
          loading={isDeletingShopType}
        />
      )}
    </div>
  );
}
