'use client';

import { useDeferredValue, useEffect, useRef, useState, type DragEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, GripVertical, Heart, LoaderCircle, MapPin, Plus, Repeat2, Search, Store, Tag, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';

type Section = { key: string; kind: string; title: string };
type Layout = { revision: number; publishedAt: string | null; sections: Section[] };
type CatalogItem = { id: string; name: string; image: string | null };
type Catalog = { items: CatalogItem[]; total: number };
type Preview = { revision: number; sections: (Catalog & { key: string })[] };
type Dragged = { type: 'section' | 'item'; key: string; sectionKey?: string };
type PlacePrediction = { description: string; place_id: string };
type PreviewPlace = { placeId: string; description: string; latitude: number; longitude: number };

const base = '/apps/deliveries/admin/home-sequence';
const layoutKey = ['home-sequence', 'draft'] as const;
const visibleLimit = 10;
const quickActions = [
  { key: 'browse', Icon: Store, surface: 'bg-[#EAF4FF]', ink: 'text-[#255B84]' },
  { key: 'deals', Icon: Tag, surface: 'bg-[#FCECF3]', ink: 'text-[#8D3E5B]' },
  { key: 'orders', Icon: Repeat2, surface: 'bg-[#EAF7F1]', ink: 'text-[#2F6B56]' },
  { key: 'favourites', Icon: Heart, surface: 'bg-[#F2EEFA]', ink: 'text-[#5D4B89]' },
] as const;

export function HomeSequenceEditor() {
  const t = useTranslations('homeSequenceEditor');
  const queryClient = useQueryClient();
  const savingRef = useRef(false);
  const [visualSections, setVisualSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [offset, setOffset] = useState(0);
  const [position, setPosition] = useState(1);
  const [addressInput, setAddressInput] = useState('');
  const [debouncedAddress, setDebouncedAddress] = useState('');
  const [previewPlace, setPreviewPlace] = useState<PreviewPlace | null>(null);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [activePlaceIndex, setActivePlaceIndex] = useState(0);
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const locationSearchRef = useRef<HTMLDivElement>(null);
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [dropTarget, setDropTarget] = useState<Dragged | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [operation, setOperation] = useState<'move' | 'publish' | null>(null);
  const [pendingMoveRevision, setPendingMoveRevision] = useState<number | null>(null);
  const [justReady, setJustReady] = useState(false);
  const previewKey = ['home-sequence', 'preview', previewPlace?.placeId ?? 'all'] as const;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedAddress(addressInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [addressInput]);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!locationSearchRef.current?.contains(event.target as Node)) setLocationMenuOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const layout = useQuery({ queryKey: layoutKey, queryFn: async () => (await Axios.get<Layout>(base)).data, staleTime: 30_000 });
  const published = useQuery({ queryKey: ['home-sequence', 'published'], queryFn: async () => (await Axios.get<Layout>(`${base}/published`)).data });
  const preview = useQuery({
    queryKey: previewKey,
    queryFn: async () => (await Axios.get<Preview>(`${base}/preview`, {
      params: previewPlace ? { latitude: previewPlace.latitude, longitude: previewPlace.longitude } : {},
    })).data,
    staleTime: 30_000,
  });
  const places = useQuery({
    queryKey: ['home-sequence', 'places', debouncedAddress],
    queryFn: async () => (await Axios.post<PlacePrediction[]>('/maps/places', { input: debouncedAddress })).data,
    enabled: !previewPlace && debouncedAddress.length >= 3,
    staleTime: 60_000,
  });
  const placeSuggestions = debouncedAddress === addressInput.trim() && !previewPlace ? places.data : undefined;
  const catalog = useQuery({
    queryKey: ['home-sequence', 'catalog', selected, deferredSearch, offset],
    queryFn: async () => (await Axios.get<Catalog>(`${base}/catalog`, {
      params: { sectionKey: selected, search: deferredSearch, offset, limit: 20 },
    })).data,
    enabled: Boolean(selected),
  });

  useEffect(() => { if (layout.data) setVisualSections(layout.data.sections); }, [layout.data]);
  const selectedSection = visualSections.find((section) => section.key === selected);
  const selectedPreview = preview.data?.sections.find((section) => section.key === selected);
  const positionCount = Math.max(1, Math.min(visibleLimit, (selectedPreview?.items.length ?? 0) + 1));
  const selectedPosition = Math.min(position, positionCount);
  const hasDraftChanges = !layout.isError && !published.isError && layout.data !== undefined && published.data !== undefined && layout.data.revision !== published.data.revision;
  const isBusy = isSaving || pendingMoveRevision !== null;

  useEffect(() => {
    if (pendingMoveRevision === null || isSaving) return;
    if (layout.isError || published.isError) {
      setPendingMoveRevision(null);
      toast.error(t('refreshError'));
      return;
    }
    if (layout.data && published.data && layout.data.revision > pendingMoveRevision && hasDraftChanges) {
      setPendingMoveRevision(null);
      setJustReady(true);
    } else if (layout.data && published.data && layout.data.revision > pendingMoveRevision && !hasDraftChanges) {
      setPendingMoveRevision(null);
    }
  }, [hasDraftChanges, isSaving, layout.data, layout.isError, pendingMoveRevision, published.data, published.isError, t]);

  useEffect(() => {
    if (!justReady) return;
    const timer = window.setTimeout(() => setJustReady(false), 2400);
    return () => window.clearTimeout(timer);
  }, [justReady]);

  async function mutate(path: string, body: Record<string, unknown>) {
    if (!layout.data || savingRef.current) return;
    savingRef.current = true;
    setOperation(path === 'publish' ? 'publish' : 'move');
    if (path === 'publish') setJustReady(false);
    else { setPendingMoveRevision(layout.data.revision); setJustReady(false); }
    setIsSaving(true);
    let applied = false;
    try {
      if (path === 'publish') {
        await Axios.post(`${base}/publish`, { ...body, expectedRevision: layout.data.revision });
        applied = true;
        toast.success(t('published'));
      } else {
        await Axios.patch(`${base}/${path}`, { ...body, expectedRevision: layout.data.revision });
        applied = true;
      }
      await queryClient.invalidateQueries({ queryKey: ['home-sequence'] });
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      toast.error(applied ? t('refreshError') : status === 409 ? t('conflict') : t('saveError'));
      setPendingMoveRevision(null);
      if (!applied) setVisualSections(layout.data.sections);
      await queryClient.invalidateQueries({ queryKey: ['home-sequence'] }).catch(() => undefined);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
      setOperation(null);
    }
  }

  function moveSection(key: string, beforeKey: string | null) {
    if (savingRef.current || isBusy || key === beforeKey) return;
    const source = visualSections.find((section) => section.key === key);
    if (!source) return;
    const next = visualSections.filter((section) => section.key !== key);
    const targetIndex = beforeKey === null ? next.length : next.findIndex((section) => section.key === beforeKey);
    next.splice(targetIndex < 0 ? next.length : targetIndex, 0, source);
    setVisualSections(next);
    void mutate('sections/move', { sectionKey: key, beforeKey });
  }

  function moveItem(sectionKey: string, item: CatalogItem, beforeId: string | null, afterId: string | null = null, atStart = false) {
    if (savingRef.current || isBusy || item.id === beforeId || item.id === afterId) return;
    queryClient.setQueryData<Preview>(previewKey, (current) => {
      if (!current) return current;
      return { ...current, sections: current.sections.map((section) => {
        if (section.key !== sectionKey) return section;
        const items = section.items.filter((entry) => entry.id !== item.id);
        const targetIndex = atStart ? 0 : beforeId ? items.findIndex((entry) => entry.id === beforeId)
          : afterId ? items.findIndex((entry) => entry.id === afterId) + 1 : items.length;
        items.splice(targetIndex < 0 ? items.length : targetIndex, 0, item);
        return { ...section, items: items.slice(0, visibleLimit) };
      }) };
    });
    void mutate('items/move', { sectionKey, itemId: item.id, beforeId, afterId, atStart });
  }

  function beginDrag(event: DragEvent, value: Dragged) {
    if (savingRef.current || isBusy) return;
    setDragged(value);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(value));
  }

  function drop(event: DragEvent, target: Dragged) {
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    setDragged(null);
    if (!dragged || dragged.type !== target.type) return;
    if (dragged.type === 'section') moveSection(dragged.key, target.key);
    if (dragged.type === 'item' && dragged.sectionKey === target.sectionKey) {
      const source = preview.data?.sections.find((section) => section.key === dragged.sectionKey)?.items.find((item) => item.id === dragged.key);
      if (source) moveItem(target.sectionKey!, source, target.key);
    }
  }

  function openSearch(sectionKey: string) {
    setSelected(sectionKey);
    setSearch('');
    setOffset(0);
    setPosition(1);
  }

  async function choosePlace(place: PlacePrediction) {
    if (resolvingPlace) return;
    setResolvingPlace(true);
    try {
      const { data } = await Axios.post<{ lat: number | string; lng: number | string }>('/maps/place-details', { placeId: place.place_id });
      const latitude = Number(data.lat);
      const longitude = Number(data.lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Invalid place coordinates');
      setPreviewPlace({ placeId: place.place_id, description: place.description, latitude, longitude });
      setAddressInput(place.description);
      setLocationMenuOpen(false);
    } catch {
      toast.error(t('placeDetailsError'));
    } finally {
      setResolvingPlace(false);
    }
  }

  function clearPlace() {
    setPreviewPlace(null);
    setAddressInput('');
    setDebouncedAddress('');
    setLocationMenuOpen(false);
    setActivePlaceIndex(0);
  }

  if (layout.isPending) return <div className="p-8" role="status">{t('loading')}</div>;
  if (layout.isError || !layout.data) return <div className="p-8" role="alert">{t('loadError')}</div>;
  return <div className="mx-auto max-w-7xl space-y-5 px-4 pb-16 pt-5 text-slate-900 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h1><p className="mt-1 max-w-2xl text-sm text-slate-600">{t('description')}</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence>{justReady && hasDraftChanges && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><Check size={16} aria-hidden="true" />{t('readyToPublish')}</motion.span>}</AnimatePresence>
        <button type="button" disabled={isBusy || !hasDraftChanges} onClick={() => void mutate('publish', {})}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-300 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-45 ${justReady && hasDraftChanges ? 'shadow-[0_0_0_4px_rgba(14,165,233,0.2)]' : ''}`}>
          <Upload size={17} aria-hidden="true" /> {t('publish')}
        </button>
      </div>
    </header>

    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-white text-sky-700 shadow-sm"><MapPin size={18} aria-hidden="true" /></span><div><h2 className="text-sm font-bold leading-5">{t('previewLocation')}</h2><p className="text-xs leading-5 text-slate-600">{previewPlace ? t('previewingLocation') : t('allLocationsHint')}</p></div></div>
        {previewPlace && <button type="button" onClick={clearPlace} className="rounded-lg px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-700">{t('allLocations')}</button>}
      </div>
      <div ref={locationSearchRef} className="relative mt-3 max-w-2xl">
        <div className={`flex min-h-11 items-center gap-2 rounded-xl border bg-white px-3 shadow-sm focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-100 ${previewPlace ? 'border-sky-200' : 'border-slate-300'}`}>
          {resolvingPlace ? <LoaderCircle size={18} className="shrink-0 animate-spin text-sky-700" aria-hidden="true" /> : <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />}
          <input role="combobox" aria-autocomplete="list" aria-expanded={locationMenuOpen && !previewPlace && addressInput.trim().length >= 3} aria-controls="home-location-suggestions" aria-activedescendant={locationMenuOpen && placeSuggestions?.[activePlaceIndex] ? `home-location-option-${activePlaceIndex}` : undefined} aria-label={t('searchAddress')} disabled={resolvingPlace} value={addressInput} onFocus={() => setLocationMenuOpen(true)} onChange={(event) => { setAddressInput(event.target.value); setPreviewPlace(null); setActivePlaceIndex(0); setLocationMenuOpen(true); }} onKeyDown={(event) => {
            if (event.key === 'Escape') setLocationMenuOpen(false);
            if (!locationMenuOpen || !placeSuggestions?.length) return;
            if (event.key === 'ArrowDown') { event.preventDefault(); setActivePlaceIndex((index) => Math.min(index + 1, placeSuggestions.length - 1)); }
            if (event.key === 'ArrowUp') { event.preventDefault(); setActivePlaceIndex((index) => Math.max(index - 1, 0)); }
            if (event.key === 'Enter') { event.preventDefault(); void choosePlace(placeSuggestions[activePlaceIndex]); }
          }} placeholder={t('searchAddress')} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-500 disabled:opacity-60" />
          {addressInput && !resolvingPlace && <button type="button" onClick={clearPlace} aria-label={t('clearLocation')} className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={16} /></button>}
        </div>
        {locationMenuOpen && !previewPlace && addressInput.trim().length >= 3 && <div id="home-location-suggestions" role="listbox" aria-label={t('searchAddress')} className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {debouncedAddress !== addressInput.trim() || places.isPending ? <p className="px-3 py-3 text-sm text-slate-600" role="status">{t('searchingPlaces')}</p> : places.isError ? <p className="px-3 py-3 text-sm text-red-700" role="alert">{t('placesError')} <button type="button" onClick={() => void places.refetch()} className="font-semibold underline">{t('retry')}</button></p> : placeSuggestions?.length ? placeSuggestions.map((place, index) => <button id={`home-location-option-${index}`} role="option" aria-selected={index === activePlaceIndex} key={place.place_id} type="button" onMouseEnter={() => setActivePlaceIndex(index)} onClick={() => void choosePlace(place)} className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-sky-50 ${index === activePlaceIndex ? 'bg-sky-50 text-sky-950' : 'text-slate-800'}`}><MapPin size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>{place.description}</span></button>) : <p className="px-3 py-3 text-sm text-slate-600">{t('noPlaces')}</p>}
        </div>}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{previewPlace ? t('selectedLocationHint') : addressInput.trim() ? t('selectAddressHint') : t('locationHint')}</p>
    </div>

    <div className="relative grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" aria-busy={isBusy}>
      <AnimatePresence>
        {isBusy && <motion.div key="saving-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="absolute inset-0 z-30 flex items-start justify-center rounded-2xl bg-white/70 px-4 pt-20 backdrop-blur-[2px]" role="status" aria-live="polite">
          <motion.div initial={{ y: 8, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -4, opacity: 0 }} className="sticky top-24 flex w-full max-w-sm items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_50px_-16px_rgba(15,23,42,0.28)]">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700"><LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" aria-hidden="true" /></span>
            <span className="min-w-0"><strong className="block text-sm font-bold text-slate-900">{operation === 'publish' ? t('publishing') : t('savingDraft')}</strong><span className="mt-0.5 block text-sm leading-5 text-slate-600">{operation === 'publish' ? t('publishingHint') : t('savingHint')}</span></span>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3 px-1"><div><h2 className="text-lg font-bold">{t('homeTab')}</h2><p className="text-sm text-slate-600">{t('previewHint')}</p></div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{t('draft')}</span></div>
        {preview.isError && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{t('previewError')} <button type="button" className="font-semibold underline" onClick={() => void preview.refetch()}>{t('retry')}</button></div>}
        <div className="space-y-3">{visualSections.map((section, index) => {
          const row = preview.data?.sections.find((entry) => entry.key === section.key);
          const isSectionTarget = dropTarget?.type === 'section' && dropTarget.key === section.key && dragged?.key !== section.key;
          return <motion.section layout transition={{ type: 'spring', stiffness: 500, damping: 42 }} key={section.key}
            className={`relative rounded-xl border bg-white p-4 transition-colors ${isSectionTarget ? 'border-sky-600 bg-sky-50/50' : 'border-slate-200'}`}
            onDragOver={(event) => { if (dragged?.type === 'section') { event.preventDefault(); setDropTarget({ type: 'section', key: section.key }); } }}
            onDrop={(event) => drop(event, { type: 'section', key: section.key })}>
            {isSectionTarget && <div className="absolute -top-1.5 inset-x-4 h-1 rounded-full bg-sky-600" />}
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <button type="button" disabled={isBusy} draggable={!isBusy} onDragStart={(event) => beginDrag(event, { type: 'section', key: section.key })} onDragEnd={() => { setDragged(null); setDropTarget(null); }} aria-label={t('dragSection', { name: section.title })} className="grid size-9 shrink-0 cursor-grab place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700 active:cursor-grabbing disabled:cursor-wait"><GripVertical size={18} /></button>
              <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-slate-500" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="min-w-0 flex-1 truncate text-base font-bold">{section.title}</h3>
              <button type="button" disabled={index === 0 || isBusy} onClick={() => moveSection(section.key, visualSections[index - 1].key)} aria-label={t('moveUp', { name: section.title })} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={17} /></button>
              <button type="button" disabled={index === visualSections.length - 1 || isBusy} onClick={() => moveSection(section.key, visualSections[index + 2]?.key ?? null)} aria-label={t('moveDown', { name: section.title })} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={17} /></button>
            </div>
            {section.kind !== 'quick-actions' && section.kind !== 'order-again' ? <>
              {preview.isPending ? <div className="h-28 animate-pulse rounded-lg bg-slate-100" /> : row?.items.length ? <div className="flex gap-2.5 overflow-x-auto pb-2">{row.items.map((item, itemIndex) => {
                const itemTarget = dropTarget?.type === 'item' && dropTarget.sectionKey === section.key && dropTarget.key === item.id && dragged?.key !== item.id;
                return <div key={item.id} draggable={!isBusy} onDragStart={(event) => { event.stopPropagation(); beginDrag(event, { type: 'item', key: item.id, sectionKey: section.key }); }} onDragEnd={() => { setDragged(null); setDropTarget(null); }}
                  onDragOver={(event) => { if (dragged?.type === 'item' && dragged.sectionKey === section.key) { event.preventDefault(); event.stopPropagation(); setDropTarget({ type: 'item', key: item.id, sectionKey: section.key }); } }}
                  onDrop={(event) => drop(event, { type: 'item', key: item.id, sectionKey: section.key })}
                  className={`relative shrink-0 cursor-grab rounded-xl border bg-white p-2 active:cursor-grabbing ${section.kind === 'banners' ? 'w-60' : section.kind === 'top-brands' ? 'w-32' : section.kind === 'shop-types' ? 'w-36' : 'w-44'} ${itemTarget ? 'border-sky-600 bg-sky-50' : 'border-slate-200'}`}>
                  {itemTarget && <div className="absolute -left-1.5 inset-y-2 w-1 rounded-full bg-sky-600" />}
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-slate-800">{itemIndex + 1}</span>
                  {item.image ? <img src={item.image} alt="" className={`w-full rounded-lg object-cover ${section.kind === 'top-brands' ? 'mx-auto h-20 w-20 rounded-full' : section.kind === 'banners' ? 'h-28' : 'h-20'}`} /> : <div className={`rounded-lg bg-slate-100 ${section.kind === 'banners' ? 'h-28' : 'h-20'}`} />}
                  <p className="mt-2 line-clamp-2 min-h-9 text-xs font-semibold leading-4">{item.name}</p>
                  <div className="mt-1 flex justify-end gap-1"><button type="button" disabled={itemIndex === 0 || isBusy} onClick={() => moveItem(section.key, item, row.items[itemIndex - 1].id)} aria-label={t('moveUp', { name: item.name })} className="grid size-7 place-items-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-25"><ArrowUp size={14} /></button><button type="button" disabled={itemIndex === row.items.length - 1 || isBusy} onClick={() => moveItem(section.key, item, null, row.items[itemIndex + 1].id)} aria-label={t('moveDown', { name: item.name })} className="grid size-7 place-items-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-25"><ArrowDown size={14} /></button></div>
                </div>;
              })}</div> : !preview.isError && <p className="rounded-lg bg-slate-50 px-3 py-5 text-sm text-slate-600">{t('noItems')}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{t('showingItems', { visible: row?.items.length ?? 0, total: row?.total ?? 0 })}</span><button type="button" onClick={() => openSearch(section.key)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-700"><Search size={15} />{t('findAndPlace')}</button></div>
            </> : section.kind === 'quick-actions' ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{quickActions.map(({ key, Icon, surface, ink }) => <div key={key} className={`${surface} flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-black/5 p-2 text-center`}><span className="grid size-10 place-items-center rounded-lg bg-white"><Icon className={`size-5 ${ink}`} strokeWidth={1.8} /></span><span className="text-xs font-semibold">{t(key)}</span></div>)}</div> : <p className="rounded-lg bg-slate-50 px-3 py-5 text-sm text-slate-600">{t('personalSection')}</p>}
          </motion.section>;
        })}</div>
        <div onDragOver={(event) => { if (dragged?.type === 'section') { event.preventDefault(); setDropTarget({ type: 'section', key: 'end' }); } }} onDrop={(event) => { event.preventDefault(); if (dragged?.type === 'section') moveSection(dragged.key, null); setDragged(null); setDropTarget(null); }} className={`mt-3 rounded-xl border border-dashed px-4 py-3 text-center text-xs ${dropTarget?.key === 'end' ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-300 text-slate-500'}`}>{t('dropAtEnd')}</div>
      </main>

      <aside className="self-start rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-4">
        <div className="flex items-start justify-between gap-2"><div><h2 className="text-base font-bold">{t('findAndPlace')}</h2>{selectedSection && <p className="mt-1 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">{selectedSection.title}</p>}</div>{selected && <button type="button" onClick={() => setSelected(null)} aria-label={t('closeSearch')} className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><X size={17} /></button>}</div>
        {selected ? <>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{t('positionLabel')}<select value={selectedPosition} onChange={(event) => setPosition(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 focus:border-sky-700 focus:outline-none">{Array.from({ length: positionCount }, (_, index) => <option key={index} value={index + 1}>{t('positionOption', { position: index + 1 })}</option>)}</select></label>
          <label className="relative mt-4 block"><Search size={17} className="absolute left-3 top-3.5 text-slate-500" aria-hidden="true" /><span className="sr-only">{t('search')}</span><input value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder={t('search')} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-700" /></label>
          <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t('results')}</h3>{catalog.data && <span className="text-xs tabular-nums text-slate-500">{t('catalogCount', { count: catalog.data.total })}</span>}</div>
          <div className="mt-2 max-h-[500px] space-y-1.5 overflow-y-auto">
            {catalog.isPending && <p className="py-8 text-center text-sm text-slate-600" role="status">{t('loading')}</p>}
            {catalog.isError && <p className="py-8 text-center text-sm text-red-700" role="alert">{t('loadError')} <button type="button" onClick={() => void catalog.refetch()} className="font-semibold underline">{t('retry')}</button></p>}
            {catalog.data?.items.map((item) => <div key={item.id} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 p-2 transition-colors hover:border-slate-300">{item.image ? <img src={item.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" /> : <div className="size-11 shrink-0 rounded-lg bg-slate-100" />}<span className="min-w-0 flex-1 truncate text-sm font-medium" title={item.name}>{item.name}</span><button type="button" disabled={isBusy || !selectedPreview} onClick={() => {
              const items = selectedPreview?.items ?? [];
              const beforeId = items[selectedPosition - 1]?.id ?? null;
              const afterId = beforeId ? null : items[items.length - 1]?.id ?? null;
              moveItem(selected, item, beforeId, afterId, items.length === 0);
            }} aria-label={t('placeItem', { name: item.name, position: selectedPosition })} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-sky-50 px-2.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-40"><Plus size={14} aria-hidden="true" />{t('place')}</button></div>)}
            {!catalog.isPending && !catalog.isError && !catalog.data?.items.length && <p className="py-8 text-center text-sm text-slate-600">{t('noItems')}</p>}
          </div>
          {(catalog.data?.total ?? 0) > 20 && <div className="mt-4 flex items-center justify-between text-sm"><button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))} className="font-medium text-sky-800 disabled:text-slate-400">{t('previous')}</button><span className="tabular-nums text-slate-600">{catalog.data?.total ? offset + 1 : 0}–{Math.min(offset + 20, catalog.data?.total ?? 0)} / {catalog.data?.total ?? 0}</span><button type="button" disabled={offset + 20 >= (catalog.data?.total ?? 0)} onClick={() => setOffset(offset + 20)} className="font-medium text-sky-800 disabled:text-slate-400">{t('next')}</button></div>}
          {previewPlace && <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">{t('localPlacementHint')}</p>}
        </> : <p className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-slate-600">{t('searchGuidance')}</p>}
      </aside>
    </div>
  </div>;
}
