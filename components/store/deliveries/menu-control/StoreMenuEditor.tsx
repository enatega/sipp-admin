'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useDeferredValue, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronsDownUp, ChevronsUpDown, EyeOff, GripVertical, Layers3, LoaderCircle, Plus, Search, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { CatalogResultsSkeleton, MenuControlSkeleton } from './MenuControlSkeleton';
import { SortableItem } from './SortableItem';

type Product = { id: string; name: string; image: string | null; price: string };
type Section = { id: string; name: string; total: number; items: Product[] };
type Category = { id: string; name: string; image: string | null; hidden: boolean; sections: Section[] };
type Layout = { revision: number; publishedAt: string | null; categories: Category[] };
type Catalog = { items: Product[]; total: number };
type LiveOrder = { key: string; ids: string[] };

const PREVIEW_LIMIT = 24;
const PRODUCT_PAGE_SIZE = 24;
const HANDLE = 'grid shrink-0 cursor-grab touch-none place-items-center rounded-lg text-slate-500 hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-ink active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40';

function moveTo(order: string[], id: string, index: number) {
  const next = order.filter((row) => row !== id);
  next.splice(index, 0, id);
  return next;
}

function neighbours(order: string[], id: string) {
  const index = order.indexOf(id);
  return { beforeId: order[index + 1] ?? null, afterId: index > 0 ? order[index - 1] : null };
}

export function StoreMenuEditor({ storeId }: { storeId: string }) {
  const t = useTranslations('storeMenuControl');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const client = useQueryClient();
  const base = `/apps/deliveries/stores/${storeId}/menu-control`;
  const draftKey = ['store-menu-control', storeId, 'draft'] as const;
  const publishedKey = ['store-menu-control', storeId, 'published'] as const;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [offset, setOffset] = useState(0);
  const [position, setPosition] = useState(1);
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
  const [syncError, setSyncError] = useState(false);
  const busyRef = useRef(false);
  const [liveOrder, setLiveOrder] = useState<LiveOrder | null>(null);
  const liveOrderRef = useRef<LiveOrder | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lastMoved, setLastMoved] = useState<string | null>(null);
  const lastMovedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  useEffect(() => () => { if (lastMovedTimer.current) clearTimeout(lastMovedTimer.current); }, []);

  const draft = useQuery({ queryKey: draftKey, queryFn: async () => (await Axios.get<Layout>(`${base}/draft`)).data, enabled: Boolean(storeId) });
  const published = useQuery({ queryKey: publishedKey, queryFn: async () => (await Axios.get<Layout>(`${base}/published`)).data, enabled: Boolean(storeId) });
  const categories = draft.data?.categories ?? [];
  const visible = arrange('categories', categories.filter((category) => !category.hidden));
  const hidden = categories.filter((category) => category.hidden);
  const activeSectionId = selectedSectionId && visible.some((category) => category.sections.some((section) => section.id === selectedSectionId))
    ? selectedSectionId : visible.flatMap((category) => category.sections)[0]?.id ?? null;
  const selectedOffset = activeSectionId ? sectionOffsets[activeSectionId] ?? 0 : 0;
  const catalog = useQuery({
    queryKey: ['store-menu-control', storeId, 'catalog', activeSectionId, deferredSearch, offset],
    queryFn: async () => (await Axios.get<Catalog>(`${base}/catalog`, {
      params: { sectionKey: activeSectionId, search: deferredSearch, offset, limit: 20 },
    })).data,
    enabled: Boolean(activeSectionId),
  });
  const sectionPageOffsets = Array.from({ length: Math.ceil(selectedOffset / PRODUCT_PAGE_SIZE) }, (_, index) => (index + 1) * PRODUCT_PAGE_SIZE);
  const sectionPages = useQueries({ queries: sectionPageOffsets.map((pageOffset) => ({
    queryKey: ['store-menu-control', storeId, 'section-page', activeSectionId, pageOffset],
    queryFn: async () => (await Axios.get<Layout>(`${base}/draft`, {
      params: { sectionKey: activeSectionId, offset: pageOffset, limit: PRODUCT_PAGE_SIZE },
    })).data.categories.flatMap((category) => category.sections).find((section) => section.id === activeSectionId)?.items ?? [],
    enabled: Boolean(activeSectionId),
  })) });
  const isSectionPageLoading = sectionPages.some((page) => page.isFetching);
  const sectionPageError = sectionPages.some((page) => page.isError);
  const loadedSectionPages = sectionPages.flatMap((page) => page.data ?? []);
  const selectedCategory = visible.find((category) => category.sections.some((section) => section.id === activeSectionId));
  const selectedSection = selectedCategory?.sections.find((section) => section.id === activeSectionId);
  const selectedItems = selectedSection ? [...selectedSection.items, ...loadedSectionPages] : [];
  const positionCount = selectedSection
    ? Math.max(1, selectedItems.length + 1)
    : 1;
  const selectedPosition = Math.min(position, positionCount);
  const hasChanges = draft.data && published.data && draft.data.revision !== published.data.revision;
  const visibleProducts = visible.reduce((count, category) => count + category.sections.reduce((sum, section) => sum + section.total, 0), 0);
  const allCollapsed = visible.length > 0 && visible.every((category) => collapsedCategories.includes(category.id));

  async function save(path: string, body: Record<string, unknown>, optimistic?: Layout, movedId?: string) {
    if (!draft.data || busyRef.current) return;
    const previous = draft.data;
    busyRef.current = true;
    setBusy(path === 'publish' ? 'publish' : 'save');
    setSavingId(movedId ?? null);
    if (optimistic) client.setQueryData(draftKey, optimistic);
    try {
      if (path === 'publish') await Axios.post(`${base}/publish`, { expectedRevision: previous.revision });
      else await Axios.patch(`${base}/${path}`, { ...body, expectedRevision: previous.revision });
    } catch (error) {
      client.setQueryData(draftKey, previous);
      const status = (error as { response?: { status?: number } }).response?.status;
      toast.error(status === 409 ? t('conflict') : t(path === 'publish' ? 'publishError' : 'saveError'));
      await draft.refetch();
      busyRef.current = false;
      setBusy(null);
      setSavingId(null);
      return;
    }
    // Draft edits never change the published menu or the catalog, so only the draft has to be reloaded before the next edit.
    const isPublish = path === 'publish';
    const [draftResult, publishedResult] = await Promise.all([draft.refetch(), isPublish ? published.refetch() : null]);
    void client.invalidateQueries({ queryKey: ['store-menu-control', storeId, 'catalog'] });
    void client.invalidateQueries({ queryKey: ['store-menu-control', storeId, 'section-page'] });
    const failedSync = !draftResult.data || draftResult.isError || (publishedResult !== null && (!publishedResult.data || publishedResult.isError));
    setSyncError(failedSync);
    if (failedSync) toast.error(t('loadError'));
    else if (isPublish) toast.success(t('published'));
    else if (movedId) flashMoved(movedId);
    busyRef.current = false;
    setBusy(null);
    setSavingId(null);
  }

  function reorder<T>(rows: T[], id: string, beforeId: string | null, key: (row: T) => string) {
    const moved = rows.find((row) => key(row) === id);
    if (!moved || id === beforeId) return rows;
    const next = rows.filter((row) => key(row) !== id);
    const index = beforeId ? next.findIndex((row) => key(row) === beforeId) : next.length;
    next.splice(index < 0 ? next.length : index, 0, moved);
    return next;
  }

  // While a list is being dragged, render it in the live order; the draft only changes once the drag is committed.
  function arrange<T extends { id: string }>(key: string, rows: T[]) {
    if (liveOrder?.key !== key) return rows;
    return liveOrder.ids.flatMap((id) => rows.filter((row) => row.id === id));
  }

  function updateLiveOrder(key: string, ids: string[]) {
    liveOrderRef.current = { key, ids };
    setLiveOrder(liveOrderRef.current);
  }

  function finishDrag(key: string, id: string, original: string[], commit: (order: string[]) => void) {
    const live = liveOrderRef.current;
    liveOrderRef.current = null;
    setLiveOrder(null);
    if (live?.key === key && live.ids.join() !== original.join()) commit(live.ids);
    else if (live?.key === key) flashMoved(id);
  }

  function flashMoved(id: string) {
    if (lastMovedTimer.current) clearTimeout(lastMovedTimer.current);
    setLastMoved(id);
    lastMovedTimer.current = setTimeout(() => setLastMoved(null), 1600);
  }

  function moveCategory(id: string, beforeId: string | null) {
    if (!draft.data || busyRef.current || id === beforeId) return;
    const next = reorder(draft.data.categories, id, beforeId, (row) => row.id);
    void save('categories/move', { categoryId: id, beforeId }, { ...draft.data, categories: next }, id);
  }

  function moveSection(categoryId: string, id: string, beforeKey: string | null) {
    if (!draft.data || busyRef.current || id === beforeKey) return;
    const next = draft.data.categories.map((category) => category.id === categoryId
      ? { ...category, sections: reorder(category.sections, id, beforeKey, (row) => row.id) } : category);
    void save('sections/move', { sectionKey: id, beforeKey }, { ...draft.data, categories: next }, id);
  }

  function moveProduct(sectionId: string, product: Product, beforeId: string | null, afterId: string | null = null) {
    if (!draft.data || busyRef.current || product.id === beforeId || product.id === afterId) return;
    const next = draft.data.categories.map((category) => ({ ...category, sections: category.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const items = [...section.items.filter((item) => item.id !== product.id)];
      const destination = afterId ? items.findIndex((item) => item.id === afterId) + 1
        : beforeId ? items.findIndex((item) => item.id === beforeId) : items.length;
      items.splice(destination < 0 ? items.length : destination, 0, product);
      return { ...section, items: items.slice(0, PREVIEW_LIMIT) };
    }) }));
    void save('products/move', { sectionKey: sectionId, productId: product.id, beforeId, afterId }, { ...draft.data, categories: next }, product.id);
  }

  function commitCategoryOrder(id: string, order: string[]) {
    moveCategory(id, neighbours(order, id).beforeId);
  }

  function commitSectionOrder(categoryId: string, id: string, order: string[]) {
    moveSection(categoryId, id, neighbours(order, id).beforeId);
  }

  // Anchor products to the item before them, so moves past the 24-product preview keep their place.
  function commitProductOrder(sectionId: string, products: Product[], id: string, order: string[]) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const { beforeId, afterId } = neighbours(order, id);
    if (afterId) moveProduct(sectionId, product, null, afterId);
    else moveProduct(sectionId, product, beforeId);
  }

  function placeProduct(product: Product) {
    if (!selectedSection) return;
    const currentIndex = selectedItems.findIndex((item) => item.id === product.id);
    const targetIndex = selectedPosition - 1;
    if (currentIndex === targetIndex) return;
    const target = selectedItems[targetIndex];
    if (currentIndex >= 0 && currentIndex < targetIndex && target) {
      moveProduct(selectedSection.id, product, null, target.id);
    } else {
      moveProduct(selectedSection.id, product, target?.id ?? null);
    }
  }

  function setHidden(category: Category, isHidden: boolean) {
    if (!draft.data || busyRef.current) return;
    if (isHidden && selectedSectionId && category.sections.some((section) => section.id === selectedSectionId)) setSelectedSectionId(null);
    const next = draft.data.categories.map((item) => item.id === category.id ? { ...item, hidden: isHidden } : item);
    void save('categories/visibility', { categoryId: category.id, hidden: isHidden }, { ...draft.data, categories: next });
  }

  function openSearch(sectionId: string) {
    setSelectedSectionId(sectionId);
    const category = visible.find((item) => item.sections.some((section) => section.id === sectionId));
    if (category) setCollapsedCategories((current) => current.filter((id) => id !== category.id));
    setSearch('');
    setOffset(0);
    setPosition(1);
    document.getElementById('menu-product-finder')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function changeSectionPage(sectionId: string, nextOffset: number) {
    setSectionOffsets((current) => ({ ...current, [sectionId]: Math.max(0, nextOffset) }));
    setSelectedSectionId(sectionId);
  }

  function handle(id: string, label: string, startDrag: (event: PointerEvent) => void, size: string) {
    const isSaving = savingId === id;
    return <button type="button" disabled={Boolean(busy)} onPointerDown={startDrag} aria-label={label} title={busy ? t('saving') : label} className={`${HANDLE} ${size} ${isSaving ? 'text-ink disabled:opacity-100' : ''}`}>{isSaving ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <GripVertical size={16} aria-hidden="true" />}</button>;
  }

  function positionSelect(name: string, ids: string[], id: string, onPick: (order: string[]) => void) {
    const index = ids.indexOf(id);
    return <select value={index} disabled={Boolean(busy) || ids.length < 2} onChange={(event) => onPick(moveTo(ids, id, Number(event.target.value)))} aria-label={t('positionOf', { name })} className="h-8 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white pl-1.5 pr-1 text-xs font-bold tabular-nums text-ink outline-none hover:border-primary-pressed/40 focus:border-ink focus:ring-2 focus:ring-ink/40 disabled:cursor-default disabled:border-transparent disabled:bg-transparent">{ids.map((_, option) => <option key={option} value={option}>{String(option + 1).padStart(2, '0')}</option>)}</select>;
  }

  if (draft.isPending || published.isPending) return <MenuControlSkeleton label={t('loading')} />;
  if (draft.isError || !draft.data || published.isError || !published.data || syncError) return <div className="rounded-xl bg-red-50 p-8 text-sm text-red-800" role="alert">{t('loadError')} <button type="button" onClick={() => { void Promise.all([draft.refetch(), published.refetch()]).then(([nextDraft, nextPublished]) => setSyncError(nextDraft.isError || nextPublished.isError)); }} className="font-semibold underline">{t('retry')}</button></div>;

  const visibleIds = visible.map((category) => category.id);
  const savedVisibleIds = categories.filter((category) => !category.hidden).map((category) => category.id);
  const highlight = (id: string) => savingId === id ? 'border-primary-pressed ring-2 ring-ink/40 animate-pulse motion-reduce:animate-none' : lastMoved === id ? 'border-emerald-500 ring-2 ring-emerald-100' : '';

  return <div className="mx-auto max-w-[1440px] space-y-5 pb-20 text-slate-900">
    <header className="border-b border-slate-200 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0"><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink"><Layers3 size={15} aria-hidden="true" />{t('editorEyebrow')}</div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{t('description')}</p></div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end"><span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${busy === 'save' ? 'bg-primary-soft text-ink' : hasChanges ? 'bg-amber-100 text-amber-950' : 'bg-emerald-50 text-emerald-800'}`}>{busy === 'save' ? <><LoaderCircle size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />{t('saving')}</> : <>{hasChanges ? <span className="size-1.5 rounded-full bg-amber-600" /> : <Check size={13} aria-hidden="true" />}{t(hasChanges ? 'unpublished' : 'upToDate')}</>}</span><button type="button" disabled={!hasChanges || Boolean(busy)} onClick={() => void save('publish', {})} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"><Upload size={17} aria-hidden="true" />{t('publish')}</button></div>
      </div>
    </header>

    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:px-5">
      <span><strong className="mr-1 text-sm text-slate-900">{visible.length}</strong>{t('visibleCategories')}</span><span className="hidden size-1 rounded-full bg-slate-300 sm:block" /><span><strong className="mr-1 text-sm text-slate-900">{visibleProducts}</strong>{t('activeProducts')}</span><span className="hidden size-1 rounded-full bg-slate-300 sm:block" /><span><strong className="mr-1 text-sm text-slate-900">{hidden.length}</strong>{t('hiddenCount')}</span><span className="ml-auto text-slate-500">{t('moveHint')}</span>
    </div>

    <div className="relative grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" aria-busy={Boolean(busy)}>
      <AnimatePresence>{busy === 'save' && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"><div className="flex items-center gap-2.5 rounded-full border border-primary-pressed/40 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg"><LoaderCircle size={17} className="animate-spin text-ink motion-reduce:animate-none" aria-hidden="true" />{t('saving')}</div></motion.div>}</AnimatePresence>
      <AnimatePresence>{busy === 'publish' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex justify-center rounded-2xl bg-white/75 pt-20 backdrop-blur-[2px]" role="status" aria-live="polite"><div className="sticky top-24 flex h-max w-[min(92%,340px)] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-ink"><LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" /></span><span><strong className="block text-sm">{t('publishing')}</strong><span className="text-xs leading-5 text-slate-600">{t('savingHint')}</span></span></div></motion.div>}</AnimatePresence>
      <section aria-label={t('previewTitle')} className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex items-center justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t('draft')}</span><h2 className="mt-1 text-xl font-bold">{t('previewTitle')}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{t('previewHint')}</p></div>{visible.length > 0 && <button type="button" onClick={() => setCollapsedCategories(allCollapsed ? [] : visibleIds)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-ink">{allCollapsed ? <ChevronsUpDown size={15} aria-hidden="true" /> : <ChevronsDownUp size={15} aria-hidden="true" />}{t(allCollapsed ? 'expandAll' : 'collapseAll')}</button>}</div></div>
        {visible.length > 0 && <nav aria-label={t('categoryNavigation')} className="overflow-x-auto border-b border-slate-100 px-4 py-3 sm:px-6"><Reorder.Group as="ol" axis="x" values={visibleIds} onReorder={(ids: string[]) => updateLiveOrder('categories', ids)} className="flex w-max gap-2">{visible.map((category, index) => <SortableItem key={category.id} value={category.id} isDisabled={Boolean(busy)} onDragEnd={() => finishDrag('categories', category.id, savedVisibleIds, (order) => commitCategoryOrder(category.id, order))} className={`flex min-h-9 shrink-0 items-center rounded-full border bg-white text-xs font-semibold text-slate-700 transition-colors hover:border-primary-pressed ${highlight(category.id) || 'border-slate-200'}`}>{(startDrag) => <>{handle(category.id, t('dragCategory', { name: category.name }), startDrag, 'ms-0.5 size-8 rounded-full')}<a href={`#menu-category-${category.id}`} title={t('categoryChipHint')} className="flex min-h-9 items-center gap-2 rounded-e-full py-1.5 pe-3 ps-0.5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"><span className="tabular-nums text-ink">{String(index + 1).padStart(2, '0')}</span>{category.name}</a></>}</SortableItem>)}</Reorder.Group></nav>}
        {visible.length === 0 && <p className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">{t('emptyMenu')}</p>}
        <Reorder.Group as="div" axis="y" values={visibleIds} onReorder={(ids: string[]) => updateLiveOrder('categories', ids)} className="space-y-4 bg-slate-50/50 p-3 sm:p-5">{visible.map((category, categoryIndex) => {
          const sections = arrange(`sections:${category.id}`, category.sections);
          const sectionIds = sections.map((section) => section.id);
          return <SortableItem as="article" key={category.id} value={category.id} id={`menu-category-${category.id}`} isDisabled={Boolean(busy)} onDragEnd={() => finishDrag('categories', category.id, savedVisibleIds, (order) => commitCategoryOrder(category.id, order))} className={`relative scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${highlight(category.id) || 'border-slate-200'}`}>{(startDrag) => <>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">{handle(category.id, t('dragCategory', { name: category.name }), startDrag, 'size-9 rounded-xl bg-slate-100')}{positionSelect(category.name, visibleIds, category.id, (order) => commitCategoryOrder(category.id, order))}{category.image ? <img src={category.image} alt="" className="size-10 shrink-0 rounded-xl object-cover" /> : <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><Layers3 size={17} /></div>}<div className="min-w-[120px] flex-1"><h3 className="truncate text-base font-bold sm:text-lg">{category.name}</h3><p className="text-xs text-slate-500">{t('sectionCount', { count: category.sections.length })}</p></div><div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white"><button type="button" disabled={categoryIndex === 0 || Boolean(busy)} onClick={() => moveCategory(category.id, visible[categoryIndex - 1].id)} aria-label={t('moveUp', { name: category.name })} className="grid size-9 place-items-center rounded-l-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" disabled={categoryIndex === visible.length - 1 || Boolean(busy)} onClick={() => moveCategory(category.id, visible[categoryIndex + 2]?.id ?? null)} aria-label={t('moveDown', { name: category.name })} className="grid size-9 place-items-center rounded-r-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-30"><ArrowDown size={16} /></button></div><button type="button" disabled={Boolean(busy)} onClick={() => setHidden(category, true)} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-40"><EyeOff size={14} aria-hidden="true" />{t('hide')}</button><button type="button" onClick={() => setCollapsedCategories((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} aria-expanded={!collapsedCategories.includes(category.id)} aria-label={t(collapsedCategories.includes(category.id) ? 'expandCategory' : 'collapseCategory', { name: category.name })} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink"><ChevronDown size={17} className={`transition-transform ${collapsedCategories.includes(category.id) ? '' : 'rotate-180'}`} /></button></div>
          {!collapsedCategories.includes(category.id) && <div className="p-3 sm:p-4">{category.sections.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">{t('emptyCategory')}</p>}
          <Reorder.Group as="ol" axis="y" values={sectionIds} onReorder={(ids: string[]) => updateLiveOrder(`sections:${category.id}`, ids)} className="space-y-3">{sections.map((section, sectionIndex) => {
            const sectionItems = section.id === activeSectionId ? [...section.items, ...loadedSectionPages] : section.items;
            const products = arrange(`products:${section.id}`, sectionItems);
            const productIds = products.map((product) => product.id);
            const savedProductIds = sectionItems.map((product) => product.id);
            return <SortableItem key={section.id} value={section.id} isDisabled={Boolean(busy)} onDragEnd={() => finishDrag(`sections:${category.id}`, section.id, category.sections.map((row) => row.id), (order) => commitSectionOrder(category.id, section.id, order))} className={`rounded-xl border p-3 transition-colors sm:p-4 ${highlight(section.id) || (activeSectionId === section.id ? 'border-primary-pressed/40 bg-primary-soft/30' : 'border-slate-200 bg-white')}`}>{(startSectionDrag) => <>
            <div className="mb-3 flex flex-wrap items-center gap-2">{handle(section.id, t('dragSection', { name: section.name }), startSectionDrag, 'size-8')}{positionSelect(section.name, sectionIds, section.id, (order) => commitSectionOrder(category.id, section.id, order))}<h4 className="min-w-[100px] flex-1 truncate text-sm font-bold sm:text-base">{section.name}</h4><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600">{t('productsCount', { count: section.total })}</span><div className="flex items-center rounded-lg border border-slate-200 bg-white"><button type="button" disabled={sectionIndex === 0 || Boolean(busy)} onClick={() => moveSection(category.id, section.id, sections[sectionIndex - 1].id)} aria-label={t('moveUp', { name: section.name })} className="grid size-8 place-items-center rounded-l-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-30"><ArrowUp size={15} /></button><button type="button" disabled={sectionIndex === sections.length - 1 || Boolean(busy)} onClick={() => moveSection(category.id, section.id, sections[sectionIndex + 2]?.id ?? null)} aria-label={t('moveDown', { name: section.name })} className="grid size-8 place-items-center rounded-r-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-30"><ArrowDown size={15} /></button></div></div>
            {products.length ? <Reorder.Group as="ol" axis="y" values={productIds} onReorder={(ids: string[]) => updateLiveOrder(`products:${section.id}`, ids)} className="space-y-2">{products.map((product, productIndex) => <SortableItem key={product.id} value={product.id} isDisabled={Boolean(busy)} onDragEnd={() => finishDrag(`products:${section.id}`, product.id, savedProductIds, (order) => commitProductOrder(section.id, products, product.id, order))} className={`flex min-w-0 items-center gap-2 rounded-xl border bg-white p-2 shadow-sm transition-colors ${highlight(product.id) || 'border-slate-200 hover:border-slate-300'}`}>{(startProductDrag) => <>{handle(product.id, t('dragProduct', { name: product.name }), startProductDrag, 'size-8')}{positionSelect(product.name, productIds, product.id, (order) => commitProductOrder(section.id, products, product.id, order))}{product.image ? <img src={product.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" /> : <div className="size-14 shrink-0 rounded-lg bg-slate-100" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={product.name}>{product.name}</p><p className="mt-0.5 text-xs tabular-nums text-slate-500">{formatCurrency(Number(product.price), resolvedCurrencySymbol)}</p></div><div className="flex shrink-0 flex-col"><button type="button" disabled={productIndex === 0 || Boolean(busy)} onClick={() => moveProduct(section.id, product, products[productIndex - 1].id)} aria-label={t('moveUp', { name: product.name })} className="grid size-7 place-items-center rounded hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-25"><ArrowUp size={14} /></button><button type="button" disabled={productIndex === products.length - 1 || Boolean(busy)} onClick={() => moveProduct(section.id, product, null, products[productIndex + 1].id)} aria-label={t('moveDown', { name: product.name })} className="grid size-7 place-items-center rounded hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-25"><ArrowDown size={14} /></button></div></>}</SortableItem>)}</Reorder.Group> : <p className="rounded-lg bg-white px-3 py-5 text-center text-sm text-slate-600">{t('emptySection')}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">{t('showing', { visible: Math.min(section.id === activeSectionId ? sectionItems.length : section.items.length, section.total), total: section.total })}</span><div className="flex items-center gap-1">{section.id === activeSectionId && selectedOffset > 0 && <button type="button" disabled={Boolean(busy)} onClick={() => changeSectionPage(section.id, 0)} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-ink hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ink disabled:text-slate-400">{t('showFirst')}</button>}{(section.id === activeSectionId ? sectionItems.length : section.items.length) < section.total && <button type="button" disabled={Boolean(busy) || (section.id === activeSectionId && isSectionPageLoading)} onClick={() => { if (section.id === activeSectionId && sectionPageError) void Promise.all(sectionPages.filter((page) => page.isError).map((page) => page.refetch())); else changeSectionPage(section.id, (section.id === activeSectionId ? selectedOffset : 0) + PRODUCT_PAGE_SIZE); }} className="min-h-9 rounded-lg px-3 text-xs font-semibold text-ink hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ink disabled:text-slate-400">{section.id === activeSectionId && isSectionPageLoading ? t('loading') : section.id === activeSectionId && sectionPageError ? t('retry') : t('seeMore', { count: Math.min(PRODUCT_PAGE_SIZE, section.total - (section.id === activeSectionId ? sectionItems.length : section.items.length)) })}</button>}<button type="button" onClick={() => openSearch(section.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-ink hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ink"><Search size={14} aria-hidden="true" />{t('findAndPlace')}</button></div></div>
          </>}</SortableItem>;
          })}</Reorder.Group></div>}
        </>}</SortableItem>;
        })}</Reorder.Group>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-4">
        <div id="menu-product-finder" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-primary-soft/60 px-5 py-4"><div className="flex items-center gap-2 text-ink"><Search size={18} aria-hidden="true" /><h2 className="text-base font-bold">{t('findAndPlace')}</h2></div><p className="mt-1 text-xs leading-5 text-slate-600">{t('finderHint')}</p></div>
          {selectedSection ? <div className="p-4 sm:p-5">
            <label className="block text-xs font-semibold text-slate-700">{t('sectionLabel')}<select value={activeSectionId ?? ''} onChange={(event) => openSearch(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-ink focus:ring-2 focus:ring-ink/40">{visible.flatMap((category) => category.sections.map((section) => <option key={section.id} value={section.id}>{category.name} · {section.name}</option>))}</select></label>
            <div className="mt-4 rounded-xl border border-primary-pressed/40 bg-primary-soft/60 p-3"><label className="block text-xs font-semibold text-slate-700">{t('positionLabel')}<select value={selectedPosition} onChange={(event) => setPosition(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-ink focus:ring-2 focus:ring-ink/40">{Array.from({ length: positionCount }, (_, index) => <option key={index} value={index + 1}>{t('position', { position: index + 1 })}</option>)}</select></label><p className="mt-2 text-xs leading-5 text-slate-600">{t('placementHint', { position: selectedPosition })}</p></div>
            <label className="relative mt-4 block"><Search size={17} className="absolute left-3 top-3 text-slate-500" aria-hidden="true" /><span className="sr-only">{t('search')}</span><input value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder={t('search')} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/40" /></label>
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-semibold text-slate-600"><span>{t('results')}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 tabular-nums">{catalog.data?.total ?? 0}</span></div>
            <div className="mt-2 max-h-[390px] space-y-1.5 overflow-y-auto pr-1">{catalog.isPending && <div role="status" aria-label={t('loading')} className="space-y-1.5"><CatalogResultsSkeleton /></div>}{catalog.isError && <p role="alert" className="py-6 text-center text-sm text-red-700">{t('catalogError')} <button type="button" onClick={() => void catalog.refetch()} className="font-semibold underline">{t('retry')}</button></p>}{catalog.data?.items.map((product) => { const alreadyHere = selectedItems[selectedPosition - 1]?.id === product.id; return <div key={product.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-primary-pressed/40">{product.image ? <img src={product.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" /> : <div className="size-11 shrink-0 rounded-lg bg-slate-100" />}<span className="min-w-0 flex-1 truncate text-xs font-semibold" title={product.name}>{product.name}</span><button type="button" disabled={Boolean(busy) || alreadyHere} onClick={() => placeProduct(product)} aria-label={alreadyHere ? t('inPosition') : t('placeProduct', { name: product.name, position: selectedPosition })} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-primary-soft px-2.5 text-xs font-semibold text-ink hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ink disabled:bg-slate-100 disabled:text-slate-500"><Plus size={13} aria-hidden="true" />{alreadyHere ? t('inPosition') : t('place')}</button></div>; })}{catalog.data?.items.length === 0 && <p className="py-6 text-center text-sm text-slate-600">{t('noResults')}</p>}</div>
            {(catalog.data?.total ?? 0) > 20 && <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))} className="min-h-8 font-semibold text-ink disabled:text-slate-400">{t('previous')}</button><span className="tabular-nums text-slate-600">{offset + 1}–{Math.min(offset + 20, catalog.data?.total ?? 0)}</span><button type="button" disabled={offset + 20 >= (catalog.data?.total ?? 0)} onClick={() => setOffset(offset + 20)} className="min-h-8 font-semibold text-ink disabled:text-slate-400">{t('next')}</button></div>}
          </div> : <p className="m-4 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-slate-600">{t('chooseSection')}</p>}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold">{t('hiddenTitle')}</h2><p className="mt-1 text-xs text-slate-500">{t('hiddenHint')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">{hidden.length}</span></div>{hidden.length ? <div className="mt-4 space-y-2">{hidden.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5"><span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span><button type="button" disabled={Boolean(busy)} onClick={() => setHidden(category, false)} className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-ink hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-40">{t('restore')}</button></div>)}</div> : <p className="mt-4 text-sm leading-6 text-slate-600">{t('noHidden')}</p>}</div>
      </aside>
    </div>
  </div>;
}
