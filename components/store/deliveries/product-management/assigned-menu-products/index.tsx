'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import EnategaLoader from '@/components/shared/EnategaLoader';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Heading } from '@/components/shared/Heading';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useGetAssignedMenuProducts } from '@/hooks/api/store/deliveries/product-management/assigned-menu-products';
import { getStorePath } from '@/lib/store';
import { getShopMode } from '@/lib/user';
import HeaderCards from './HeaderCards';
import AssignedMenuProductsTable from './Table';
import type { AssignedMenuProduct, MenuCard } from './types';

const resolveStockFromTab = (tab: string, row: AssignedMenuProduct) => {
  if (tab === 'in_stock') {
    return row.inStock;
  }

  if (tab === 'out_of_stock') {
    return !row.inStock;
  }

  return true;
};

export default function AssignedMenuProductsPage() {
  const t = useTranslations('products');
  const tPage = useTranslations('products.assignedMenuProducts');
  const { getParam, setParams } = useQueryParams();
  const router = useRouter();
  const { storeId } = useParams() as { storeId?: string };
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const shopMode = isHydrated ? getShopMode() : null;
  const { data, isLoading } = useGetAssignedMenuProducts({
    enabled: isHydrated && shopMode === 'STORE_CHAIN',
    placeholderData: (previousData) => previousData,
  });
  const menus = useMemo(() => data?.data ?? [], [data?.data]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('tabs.all') },
    { value: 'in_stock', label: t('tabs.inStock') },
    { value: 'out_of_stock', label: t('tabs.outOfStock') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'tab',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  const searchParam = getParam('search') || '';
  const [searchText, setSearchText] = useState(searchParam);

  useEffect(() => {
    if (!isHydrated || !storeId) return;

    if (shopMode !== 'STORE_CHAIN') {
      router.replace(getStorePath(storeId, '/product-management/products'));
    }
  }, [isHydrated, router, shopMode, storeId]);

  useEffect(() => {
    setSearchText(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== searchParam) {
        setParams({ search: searchText || null, page: '1' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParam, searchText, setParams]);

  const menuCards = useMemo<MenuCard[]>(() => {
    return menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      totalProducts: menu.totalProducts ?? menu.products.length,
      inStockProducts: menu.inStockProducts ?? 0,
      outOfStockProducts: menu.outOfStockProducts ?? 0,
    }));
  }, [menus]);

  useEffect(() => {
    if (!menuCards.length) {
      if (selectedMenuId !== null) {
        setSelectedMenuId(null);
      }
      return;
    }

    const selectedExists = selectedMenuId
      ? menuCards.some((menu) => menu.id === selectedMenuId)
      : false;

    if (!selectedExists) {
      setSelectedMenuId(menuCards[0].id);
    }
  }, [menuCards, selectedMenuId]);

  const rows = useMemo<AssignedMenuProduct[]>(
    () =>
      menus.flatMap<AssignedMenuProduct>((menu) =>
        (menu.products ?? []).map((product) => ({
          id: product.id,
          menuId: menu.id,
          menuName: menu.name,
          name: product.name,
          category: product.category || '-',
          price: Number(product.price ?? 0),
          addon: '',
          unitOfMeasure: product.unitOfMeasure || '',
          stockQuantity: product.stockQuantity ?? 0,
          inStock: Boolean(product.inStock),
          isActive: Boolean(product.isActive),
        })),
      ),
    [menus],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchParam.trim().toLowerCase();

    return rows.filter((row) => {
      if (selectedMenuId && row.menuId !== selectedMenuId) {
        return false;
      }

      if (!resolveStockFromTab(active, row)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.name, row.category, row.menuName, row.unitOfMeasure].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [active, rows, searchParam, selectedMenuId]);

  const handleSelectMenu = (menuId: string) => {
    setSelectedMenuId(menuId);
    setParams({ page: '1' });
  };

  if (!isHydrated || !shopMode) {
    return <EnategaLoader />;
  }

  if (shopMode !== 'STORE_CHAIN') {
    return <EnategaLoader />;
  }

  return (
    <div className="space-y-6">
      <Heading title={tPage('title')} />

      <Tabs value={active} onValueChange={setActive}>
        <TabsContent value={active} className="mt-0 space-y-5">
          <HeaderCards
            tabs={tabs}
            activeTab={active}
            onTabChange={setActive}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            searchPlaceholder={t('filters.searchPlaceholder')}
            menuCards={menuCards}
            selectedMenuId={selectedMenuId}
            onSelectMenu={handleSelectMenu}
            isLoading={isLoading}
          />

          <AssignedMenuProductsTable
            rows={filteredRows}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
