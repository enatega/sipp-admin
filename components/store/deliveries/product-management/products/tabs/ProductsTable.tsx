'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useDeleteProduct,
  useGetProducts,
  useToggleProductInStock,
} from '@/hooks/api/store/deliveries/product-management/products';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { useCurrency } from '@/hooks/use-currency';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import {
  buildDealSummaryIndex,
  calculatePriceAfterDeal,
  extractAppliedDealsFromProduct,
  getProductAppliedDealRef,
  resolveAppliedDealSummary,
} from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { getProductCoverImage } from '@/lib/product-images';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { getStorePath } from '@/lib/store';
import type { ApiErrorResponse } from '@/types';
import type { Product } from '@/types/entities/store/deliveries/product';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
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
import { TableShimmer, type TLimitType } from '@/components/shared/TableShimmer';
import { ProductDetailDialog } from '@/components/store/deliveries/product-management/products/product-detail/ProductDetailDialog';
import ProductActions from './ProductActions';
import Filters from './Filters';

const UNLIMITED_STOCK_THRESHOLD = 1000000;

export function ProductsTable() {
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const { getParam } = useQueryParams();
  const t = useTranslations('products');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const { data: activeDeals } = useGetActiveDeals(
    storeId
      ? {
          store_id: storeId,
          offset: 0,
          limit: 200,
        }
      : null,
    {
      enabled: !!storeId,
    },
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const limit = Number(getParam('limit')) || 10;

  const { data, isLoading, isFetching, isError, error } = useGetProducts({
    placeholderData: (previous) => previous,
  });
  const showTableLoading = isLoading || isFetching;

  const {
    mutate: toggleInStock,
    variables: togglingId,
    isPending: isToggling,
  } = useToggleProductInStock({
    onError: (toggleError) => {
      handleApiError(toggleError);
    },
  });

  const {
    mutate: deleteProduct,
    isPending: isDeleting,
  } = useDeleteProduct({
    onSuccess: (response) => {
      toast.success(response.message || t('success.delete'));
      setDeletingProduct(null);
    },
    onError: (deleteError) => {
      handleApiError(deleteError);
    },
  });

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((product) => ({
        ...product,
        categorySortName:
          product.category?.categoryName || product.category?.name || '',
      })),
    [data],
  );
  const { items, requestSort, sortConfig } = useSortableData<Product>(rows);

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      return t('table.notAvailable');
    }

    return formatCurrency(numericPrice, resolvedCurrencySymbol);
  };
  const formatStockQuantity = (quantity: unknown) => {
    const parsed = Number(quantity);
    if (Number.isNaN(parsed)) return t('table.notAvailable');
    if (parsed >= UNLIMITED_STOCK_THRESHOLD) return 'Unlimited';
    return String(parsed);
  };

  const dealSummaryIndex = buildDealSummaryIndex(activeDeals?.data);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Filters />
      </div>

      <div className="rounded-md border overflow-auto mt-4">
        <Table className="min-w-[1080px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHead className="w-[80px]">{t('table.image')}</TableHead>
              <TableHeaderCell
                label={t('table.name')}
                sortKey="name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.category')}
                sortKey="categorySortName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={`${t('table.price')} (${resolvedCurrencySymbol})`}
                sortKey="price"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{`${t('table.priceAfterDeal')} (${resolvedCurrencySymbol})`}</TableHead>
              <TableHeaderCell
                label={t('table.unitOfMeasure')}
                sortKey="unitOfMeasure"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.stockQuantity')}
                sortKey="stockQuantity"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('table.inStock')}</TableHead>
              <TableHead>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showTableLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={9} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8">
                  <DisplayError
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('errors.fetchFailed')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8">
                  <NoDataFound title={t('errors.noProducts')} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((product) => (
                <TableRow
                  key={product.id}
                  className="!h-[55px] cursor-pointer hover:bg-accent/50"
                  onClick={() => setSelectedProduct(product)}
                >
                  <TableCell className="w-[80px]">
                    {getProductCoverImage(product) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProductCoverImage(product) ?? ''}
                        alt={product.name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.category?.categoryName ||
                      product.category?.name ||
                      t('table.notAvailable')}
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {(() => {
                      const appliedDeals = extractAppliedDealsFromProduct(
                        product as Record<string, unknown>,
                      );
                      const productDealRef = getProductAppliedDealRef(appliedDeals);
                      const productDealSummary = resolveAppliedDealSummary(
                        productDealRef,
                        dealSummaryIndex,
                      );
                      if (!productDealSummary) return t('table.notAvailable');

                      const discountedPrice = calculatePriceAfterDeal(
                        Number(product.price),
                        productDealSummary,
                      );
                      if (discountedPrice === null) return t('table.notAvailable');

                      return formatCurrency(discountedPrice, resolvedCurrencySymbol);
                    })()}
                  </TableCell>
                  <TableCell>
                    {product.unitOfMeasure || t('table.notAvailable')}
                  </TableCell>
                  <TableCell>{formatStockQuantity(product.stockQuantity)}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Switch
                      checked={product.inStock}
                      disabled={isToggling && togglingId === product.id}
                      onCheckedChange={() => toggleInStock(product.id)}
                    />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <ProductActions
                      onView={() => setSelectedProduct(product)}
                      onEdit={() =>
                        router.push(
                          getStorePath(
                            storeId,
                            `/product-management/products/edit-product/${product.id}`,
                          ),
                        )
                      }
                      onDelete={() => setDeletingProduct(product)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="rounded-b-md border-t bg-accent/30 p-3">
          {!showTableLoading && !isError && items.length > 0 && (
            <AppPagination
              page={data?.meta.page || 1}
              totalPages={data?.meta.totalPages || 1}
              totalData={data?.meta.total || 0}
              defaultLimit={limit as TLimitType}
            />
          )}
        </div>
      </div>

      <AppAlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
        title={t('errors.deleteTitle')}
        subTitle={t('errors.deleteDescription')}
        confirmLabel={t('errors.deleteConfirm')}
        onConfirm={() => {
          if (deletingProduct) {
            deleteProduct(deletingProduct.id);
          }
        }}
        loading={isDeleting}
        variant="delete"
      />

      <ProductDetailDialog
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </div>
  );
}
