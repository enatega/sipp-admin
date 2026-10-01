'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useDeferredValue, useRef, useState, type DragEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, ChevronDown, EyeOff, GripVertical, Layers3, LoaderCircle, Plus, Search, Sparkles, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';

type Product = { id: string; name: string; image: string | null; price: string };
type Section = { id: string; name: string; total: number; items: Product[] };
type Category = { id: string; name: string; image: string | null; hidden: boolean; sections: Section[] };
type Layout = { revision: number; publishedAt: string | null; categories: Category[] };
type Catalog = { items: Product[]; total: number };
type Dragged = { kind: 'category' | 'section' | 'product'; id: string; parentId?: string };

const PREVIEW_LIMIT = 24;

export function StoreMenuEditor({ storeId }: { storeId: string }) {
  const t = useTranslations('storeMenuControl');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const client = useQueryClient();
  const base = `/apps/deliveries/stores/${storeId}/menu-control`;
  const draftKey = ['store-menu-control', storeId, 'draft'] as const;
  const publishedKey = ['store-menu-control', storeId, 'published'] as const;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [offset, setOffset] = useState(0);
  const [position, setPosition] = useState(1);
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
  const [syncError, setSyncError] = useState(false);
  const busyRef = useRef(false);
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [dropTarget, setDropTarget] = useState<Dragged | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  const draft = useQuery({ queryKey: draftKey, queryFn: async () => (await Axios.get<Layout>(`${base}/draft`)).data, enabled: Boolean(storeId) });
  const published = useQuery({ queryKey: publishedKey, queryFn: async () => (await Axios.get<Layout>(`${base}/published`)).data, enabled: Boolean(storeId) });
  const categories = draft.data?.categories ?? [];
  const visible = categories.filter((category) => !category.hidden);
  const hidden = categories.filter((category) => category.hidden);
  const activeSectionId = selectedSectionId && visible.some((category) => category.sections.some((section) => section.id === selectedSectionId))
    ? selectedSectionId : visible.flatMap((category) => category.sections)[0]?.id ?? null;
  const catalog = useQuery({
    queryKey: ['store-menu-control', storeId, 'catalog', activeSectionId, deferredSearch, offset],
    queryFn: async () => (await Axios.get<Catalog>(`${base}/catalog`, {
      params: { sectionKey: activeSectionId, search: deferredSearch, offset, limit: 20 },
    })).data,
    enabled: Boolean(activeSectionId),
  });
  const selectedCategory = visible.find((category) => category.sections.some((section) => section.id === activeSectionId));
  const selectedSection = selectedCategory?.sections.find((section) => section.id === activeSectionId);
  const positionCount = selectedSection
    ? Math.max(1, selectedSection.items.length + (selectedSection.total <= selectedSection.items.length ? 1 : 0))
    : 1;
  const selectedPosition = Math.min(position, positionCount);
  const hasChanges = draft.data && published.data && draft.data.revision !== published.data.revision;
  const visibleProducts = visible.reduce((count, category) => count + category.sections.reduce((sum, section) => sum + section.total, 0), 0);

  async function save(path: string, body: Record<string, unknown>, optimistic?: Layout) {
    if (!draft.data || busyRef.current) return;
    const previous = draft.data;
    busyRef.current = true;
    setBusy(path === 'publish' ? 'publish' : 'save');
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
      return;
    }
    const [draftResult, publishedResult] = await Promise.all([draft.refetch(), published.refetch()]);
    await client.invalidateQueries({ queryKey: ['store-menu-control', storeId, 'catalog'] });
    const failedSync = !draftResult.data || draftResult.isError || !publishedResult.data || publishedResult.isError;
    setSyncError(failedSync);
    if (failedSync) toast.error(t('loadError'));
    else if (path === 'publish') toast.success(t('published'));
    busyRef.current = false;
    setBusy(null);
  }

  function reorder<T>(rows: T[], id: string, beforeId: string | null, key: (row: T) => string) {
    const moved = rows.find((row) => key(row) === id);
    if (!moved || id === beforeId) return rows;
    const next = rows.filter((row) => key(row) !== id);
    const index = beforeId ? next.findIndex((row) => key(row) === beforeId) : next.length;
    next.splice(index < 0 ? next.length : index, 0, moved);
    return next;
  }

  function moveCategory(id: string, beforeId: string | null) {
    if (!draft.data || busyRef.current || id === beforeId) return;
    const next = reorder(draft.data.categories, id, beforeId, (row) => row.id);
    void save('categories/move', { categoryId: id, beforeId }, { ...draft.data, categories: next });
  }

  function moveSection(categoryId: string, id: string, beforeKey: string | null) {
    if (!draft.data || busyRef.current || id === beforeKey) return;
    const next = draft.data.categories.map((category) => category.id === categoryId
      ? { ...category, sections: reorder(category.sections, id, beforeKey, (row) => row.id) } : category);
    void save('sections/move', { sectionKey: id, beforeKey }, { ...draft.data, categories: next });
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
    void save('products/move', { sectionKey: sectionId, productId: product.id, beforeId, afterId }, { ...draft.data, categories: next });
  }

  function placeProduct(product: Product) {
    if (!selectedSection) return;
    const currentIndex = selectedSection.items.findIndex((item) => item.id === product.id);
    const targetIndex = selectedPosition - 1;
    if (currentIndex === targetIndex) return;
    const target = selectedSection.items[targetIndex];
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

  function beginDrag(event: DragEvent, item: Dragged) {
    if (busyRef.current) return;
    setDragged(item);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
  }

  function drop(event: DragEvent, target: Dragged) {
    if (!dragged || dragged.kind !== target.kind || dragged.parentId !== target.parentId) return;
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    setDragged(null);
    if (target.kind === 'category') moveCategory(dragged.id, target.id);
    if (target.kind === 'section') moveSection(target.parentId!, dragged.id, target.id === 'end' ? null : target.id);
    if (target.kind === 'product') {
      const section = categories.flatMap((category) => category.sections).find((item) => item.id === target.parentId);
      const item = section?.items.find((product) => product.id === dragged.id);
      if (item) {
        if (target.id === 'end' && section && section.total > section.items.length) {
          moveProduct(target.parentId!, item, null, section.items[section.items.length - 1]?.id ?? null);
        } else {
          moveProduct(target.parentId!, item, target.id === 'end' ? null : target.id);
        }
      }
    }
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

  if (draft.isPending || published.isPending) return <div className="rounded-xl bg-white p-8 text-sm text-slate-600" role="status">{t('loading')}</div>;
  if (draft.isError || !draft.data || published.isError || !published.data || syncError) return <div className="rounded-xl bg-red-50 p-8 text-sm text-red-800" role="alert">{t('loadError')} <button type="button" onClick={() => { void Promise.all([draft.refetch(), published.refetch()]).then(([nextDraft, nextPublished]) => setSyncError(nextDraft.isError || nextPublished.isError)); }} className="font-semibold underline">{t('retry')}</button></div>;

  return <div className="mx-auto max-w-[1440px] space-y-5 pb-20 text-slate-900">
    <header className="sticky top-0 z-20 -mx-3 rounded-b-2xl border-b border-slate-200 bg-white/95 px-3 py-4 shadow-sm backdrop-blur sm:mx-0 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0"><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-700"><Layers3 size={15} aria-hidden="true" />{t('editorEyebrow')}</div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{t('description')}</p></div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end"><span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${hasChanges ? 'bg-amber-100 text-amber-950' : 'bg-emerald-50 text-emerald-800'}`}>{hasChanges ? <span className="size-1.5 rounded-full bg-amber-600" /> : <Check size={13} aria-hidden="true" />}{t(hasChanges ? 'unpublished' : 'upToDate')}</span><button type="button" disabled={!hasChanges || Boolean(busy)} onClick={() => void save('publish', {})} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"><Upload size={17} aria-hidden="true" />{t('publish')}</button></div>
      </div>
    </header>

    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:px-5">
      <span><strong className="mr-1 text-sm text-slate-900">{visible.length}</strong>{t('visibleCategories')}</span><span className="hidden size-1 rounded-full bg-slate-300 sm:block" /><span><strong className="mr-1 text-sm text-slate-900">{visibleProducts}</strong>{t('activeProducts')}</span><span className="hidden size-1 rounded-full bg-slate-300 sm:block" /><span><strong className="mr-1 text-sm text-slate-900">{hidden.length}</strong>{t('hiddenCount')}</span><span className="ml-auto text-slate-500">{t('moveHint')}</span>
    </div>

    <div className="relative grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" aria-busy={Boolean(busy)}>
      <AnimatePresence>{busy && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex justify-center rounded-2xl bg-white/75 pt-20 backdrop-blur-[2px]" role="status" aria-live="polite"><div className="sticky top-24 flex h-max w-[min(92%,340px)] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" /></span><span><strong className="block text-sm">{t(busy === 'publish' ? 'publishing' : 'saving')}</strong><span className="text-xs leading-5 text-slate-600">{t('savingHint')}</span></span></div></motion.div>}</AnimatePresence>
      <section aria-label={t('previewTitle')} className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex items-center justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t('draft')}</span><h2 className="mt-1 text-xl font-bold">{t('previewTitle')}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{t('previewHint')}</p></div><div className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700 sm:grid"><Sparkles size={22} aria-hidden="true" /></div></div></div>
        {visible.length > 0 && <nav aria-label={t('categoryNavigation')} className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3 sm:px-6">{visible.map((category, index) => <a key={category.id} href={`#menu-category-${category.id}`} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-700"><span className="tabular-nums text-sky-700">{String(index + 1).padStart(2, '0')}</span>{category.name}</a>)}</nav>}
        {visible.length === 0 && <p className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">{t('emptyMenu')}</p>}
        <div className="space-y-4 bg-slate-50/50 p-3 sm:p-5">{visible.map((category, categoryIndex) => <motion.article layout key={category.id} id={`menu-category-${category.id}`} className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${dropTarget?.kind === 'category' && dropTarget.id === category.id ? 'border-sky-600 ring-2 ring-sky-100' : 'border-slate-200'}`} onDragOver={(event) => { if (dragged?.kind === 'category') { event.preventDefault(); setDropTarget({ kind: 'category', id: category.id }); } }} onDrop={(event) => drop(event, { kind: 'category', id: category.id })}>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4"><button type="button" draggable={!busy} onDragStart={(event) => beginDrag(event, { kind: 'category', id: category.id })} onDragEnd={() => { setDragged(null); setDropTarget(null); }} aria-label={t('dragCategory', { name: category.name })} className="grid size-9 shrink-0 cursor-grab place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-sky-700"><GripVertical size={18} /></button><span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-sky-700">{String(categoryIndex + 1).padStart(2, '0')}</span>{category.image ? <img src={category.image} alt="" className="size-10 shrink-0 rounded-xl object-cover" /> : <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><Layers3 size={17} /></div>}<div className="min-w-[120px] flex-1"><h3 className="truncate text-base font-bold sm:text-lg">{category.name}</h3><p className="text-xs text-slate-500">{t('sectionCount', { count: category.sections.length })}</p></div><div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white"><button type="button" disabled={categoryIndex === 0 || Boolean(busy)} onClick={() => moveCategory(category.id, visible[categoryIndex - 1].id)} aria-label={t('moveUp', { name: category.name })} className="grid size-9 place-items-center rounded-l-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" disabled={categoryIndex === visible.length - 1 || Boolean(busy)} onClick={() => moveCategory(category.id, visible[categoryIndex + 2]?.id ?? null)} aria-label={t('moveDown', { name: category.name })} className="grid size-9 place-items-center rounded-r-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-30"><ArrowDown size={16} /></button></div><button type="button" disabled={Boolean(busy)} onClick={() => setHidden(category, true)} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-40"><EyeOff size={14} aria-hidden="true" />{t('hide')}</button><button type="button" onClick={() => setCollapsedCategories((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} aria-expanded={!collapsedCategories.includes(category.id)} aria-label={t(collapsedCategories.includes(category.id) ? 'expandCategory' : 'collapseCategory', { name: category.name })} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700"><ChevronDown size={17} className={`transition-transform ${collapsedCategories.includes(category.id) ? '' : 'rotate-180'}`} /></button></div>
          {!collapsedCategories.includes(category.id) && <div className="space-y-3 p-3 sm:p-4">{category.sections.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">{t('emptyCategory')}</p>}
          {category.sections.map((section, sectionIndex) => <motion.div layout key={section.id} className={`rounded-xl border p-3 transition-colors sm:p-4 ${dropTarget?.kind === 'section' && dropTarget.id === section.id ? 'border-sky-600 bg-sky-50/50' : activeSectionId === section.id ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'}`} onDragOver={(event) => { if (dragged?.kind === 'section' && dragged.parentId === category.id) { event.preventDefault(); event.stopPropagation(); setDropTarget({ kind: 'section', id: section.id, parentId: category.id }); } }} onDrop={(event) => drop(event, { kind: 'section', id: section.id, parentId: category.id })}>
            <div className="mb-3 flex flex-wrap items-center gap-2"><button type="button" draggable={!busy} onDragStart={(event) => { event.stopPropagation(); beginDrag(event, { kind: 'section', id: section.id, parentId: category.id }); }} onDragEnd={() => { setDragged(null); setDropTarget(null); }} aria-label={t('dragSection', { name: section.name })} className="grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700"><GripVertical size={16} /></button><span className="text-xs font-bold tabular-nums text-sky-700">{String(sectionIndex + 1).padStart(2, '0')}</span><h4 className="min-w-[100px] flex-1 truncate text-sm font-bold sm:text-base">{section.name}</h4><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600">{t('productsCount', { count: section.total })}</span><div className="flex items-center rounded-lg border border-slate-200 bg-white"><button type="button" disabled={sectionIndex === 0 || Boolean(busy)} onClick={() => moveSection(category.id, section.id, category.sections[sectionIndex - 1].id)} aria-label={t('moveUp', { name: section.name })} className="grid size-8 place-items-center rounded-l-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-30"><ArrowUp size={15} /></button><button type="button" disabled={sectionIndex === category.sections.length - 1 || Boolean(busy)} onClick={() => moveSection(category.id, section.id, category.sections[sectionIndex + 2]?.id ?? null)} aria-label={t('moveDown', { name: section.name })} className="grid size-8 place-items-center rounded-r-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-30"><ArrowDown size={15} /></button></div></div>
            {section.items.length ? <div className="grid gap-2 md:grid-cols-2">{section.items.map((product, productIndex) => <motion.div layout key={product.id}><div draggable={!busy} onDragStart={(event) => { event.stopPropagation(); beginDrag(event, { kind: 'product', id: product.id, parentId: section.id }); }} onDragEnd={() => { setDragged(null); setDropTarget(null); }} onDragOver={(event) => { if (dragged?.kind === 'product' && dragged.parentId === section.id) { event.preventDefault(); event.stopPropagation(); setDropTarget({ kind: 'product', id: product.id, parentId: section.id }); } }} onDrop={(event) => drop(event, { kind: 'product', id: product.id, parentId: section.id })} className={`flex min-w-0 cursor-grab items-center gap-2 rounded-xl border bg-white p-2 shadow-sm transition-colors ${dropTarget?.kind === 'product' && dropTarget.id === product.id ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'} ${dragged?.kind === 'product' && dragged.id === product.id ? 'opacity-50' : ''}`}><GripVertical size={15} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-slate-400">{productIndex + 1}</span>{product.image ? <img src={product.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" /> : <div className="size-14 shrink-0 rounded-lg bg-slate-100" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={product.name}>{product.name}</p><p className="mt-0.5 text-xs tabular-nums text-slate-500">{formatCurrency(Number(product.price), resolvedCurrencySymbol)}</p></div><div className="flex shrink-0 flex-col"><button type="button" disabled={productIndex === 0 || Boolean(busy)} onClick={() => moveProduct(section.id, product, section.items[productIndex - 1].id)} aria-label={t('moveUp', { name: product.name })} className="grid size-7 place-items-center rounded hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-25"><ArrowUp size={14} /></button><button type="button" disabled={productIndex === section.items.length - 1 || Boolean(busy)} onClick={() => moveProduct(section.id, product, null, section.items[productIndex + 1].id)} aria-label={t('moveDown', { name: product.name })} className="grid size-7 place-items-center rounded hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-25"><ArrowDown size={14} /></button></div></div></motion.div>)}</div> : <p className="rounded-lg bg-white px-3 py-5 text-center text-sm text-slate-600">{t('emptySection')}</p>}
            {dragged?.kind === 'product' && dragged.parentId === section.id && section.items.length > 1 && <div onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setDropTarget({ kind: 'product', id: 'end', parentId: section.id }); }} onDrop={(event) => drop(event, { kind: 'product', id: 'end', parentId: section.id })} className={`mt-2 rounded-lg border border-dashed px-3 py-2 text-center text-xs ${dropTarget?.kind === 'product' && dropTarget.id === 'end' && dropTarget.parentId === section.id ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-500'}`}>{t('dropProductAtEnd')}</div>}
            <div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">{t('showing', { visible: section.items.length, total: section.total })}</span><button type="button" onClick={() => openSearch(section.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-700"><Search size={14} aria-hidden="true" />{t('findAndPlace')}</button></div>
          </motion.div>)}{dragged?.kind === 'section' && dragged.parentId === category.id && category.sections.length > 1 && <div onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setDropTarget({ kind: 'section', id: 'end', parentId: category.id }); }} onDrop={(event) => drop(event, { kind: 'section', id: 'end', parentId: category.id })} className={`rounded-lg border border-dashed px-3 py-2 text-center text-xs ${dropTarget?.kind === 'section' && dropTarget.id === 'end' && dropTarget.parentId === category.id ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-500'}`}>{t('dropSectionAtEnd')}</div>}</div>}
        </motion.article>)}</div>
        {dragged?.kind === 'category' && visible.length > 1 && <div onDragOver={(event) => { event.preventDefault(); setDropTarget({ kind: 'category', id: 'end' }); }} onDrop={(event) => { event.preventDefault(); moveCategory(dragged.id, null); setDragged(null); setDropTarget(null); }} className={`mt-3 rounded-xl border border-dashed px-4 py-3 text-center text-xs ${dropTarget?.id === 'end' ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-300 text-slate-500'}`}>{t('dropAtEnd')}</div>}
      </section>

      <aside className="space-y-4 xl:sticky xl:top-4">
        <div id="menu-product-finder" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-sky-50/60 px-5 py-4"><div className="flex items-center gap-2 text-sky-800"><Search size={18} aria-hidden="true" /><h2 className="text-base font-bold">{t('findAndPlace')}</h2></div><p className="mt-1 text-xs leading-5 text-slate-600">{t('finderHint')}</p></div>
          {selectedSection ? <div className="p-4 sm:p-5">
            <label className="block text-xs font-semibold text-slate-700">{t('sectionLabel')}<select value={activeSectionId ?? ''} onChange={(event) => openSearch(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100">{visible.flatMap((category) => category.sections.map((section) => <option key={section.id} value={section.id}>{category.name} · {section.name}</option>))}</select></label>
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-3"><label className="block text-xs font-semibold text-slate-700">{t('positionLabel')}<select value={selectedPosition} onChange={(event) => setPosition(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100">{Array.from({ length: positionCount }, (_, index) => <option key={index} value={index + 1}>{t('position', { position: index + 1 })}</option>)}</select></label><p className="mt-2 text-xs leading-5 text-slate-600">{t('placementHint', { position: selectedPosition })}</p></div>
            <label className="relative mt-4 block"><Search size={17} className="absolute left-3 top-3 text-slate-500" aria-hidden="true" /><span className="sr-only">{t('search')}</span><input value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder={t('search')} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100" /></label>
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-semibold text-slate-600"><span>{t('results')}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 tabular-nums">{catalog.data?.total ?? 0}</span></div>
            <div className="mt-2 max-h-[390px] space-y-1.5 overflow-y-auto pr-1">{catalog.isPending && <p role="status" className="py-6 text-center text-sm text-slate-600">{t('loading')}</p>}{catalog.isError && <p role="alert" className="py-6 text-center text-sm text-red-700">{t('catalogError')} <button type="button" onClick={() => void catalog.refetch()} className="font-semibold underline">{t('retry')}</button></p>}{catalog.data?.items.map((product) => { const alreadyHere = selectedSection.items[selectedPosition - 1]?.id === product.id; return <div key={product.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-sky-200">{product.image ? <img src={product.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" /> : <div className="size-11 shrink-0 rounded-lg bg-slate-100" />}<span className="min-w-0 flex-1 truncate text-xs font-semibold" title={product.name}>{product.name}</span><button type="button" disabled={Boolean(busy) || alreadyHere} onClick={() => placeProduct(product)} aria-label={alreadyHere ? t('inPosition') : t('placeProduct', { name: product.name, position: selectedPosition })} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-sky-50 px-2.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:bg-slate-100 disabled:text-slate-500"><Plus size={13} aria-hidden="true" />{alreadyHere ? t('inPosition') : t('place')}</button></div>; })}{catalog.data?.items.length === 0 && <p className="py-6 text-center text-sm text-slate-600">{t('noResults')}</p>}</div>
            {(catalog.data?.total ?? 0) > 20 && <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))} className="min-h-8 font-semibold text-sky-800 disabled:text-slate-400">{t('previous')}</button><span className="tabular-nums text-slate-600">{offset + 1}–{Math.min(offset + 20, catalog.data?.total ?? 0)}</span><button type="button" disabled={offset + 20 >= (catalog.data?.total ?? 0)} onClick={() => setOffset(offset + 20)} className="min-h-8 font-semibold text-sky-800 disabled:text-slate-400">{t('next')}</button></div>}
          </div> : <p className="m-4 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-slate-600">{t('chooseSection')}</p>}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold">{t('hiddenTitle')}</h2><p className="mt-1 text-xs text-slate-500">{t('hiddenHint')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">{hidden.length}</span></div>{hidden.length ? <div className="mt-4 space-y-2">{hidden.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5"><span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span><button type="button" disabled={Boolean(busy)} onClick={() => setHidden(category, false)} className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-40">{t('restore')}</button></div>)}</div> : <p className="mt-4 text-sm leading-6 text-slate-600">{t('noHidden')}</p>}</div>
      </aside>
    </div>
  </div>;
}
