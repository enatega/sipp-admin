'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Download, Eye, ImageOff, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import { ImagePreview } from '@/components/shared/ImagePreview';
import NoDataFound from '@/components/shared/NoDataFound';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { SearchInput } from '@/components/shared/SearchInput';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BULK_IMAGE_HISTORY_DAYS,
  clearAllHistory,
  clearHistoryDay,
  getRetainedDayKeys,
  removeFromHistory,
  toDayKey,
  type BulkImageRecord,
} from '@/lib/bulk-image-upload/history';
import { copyText, downloadTextFile, formatFileSize, toCsv } from './format';

interface Props {
  records: BulkImageRecord[];
  now: Date;
}

type ConfirmState = { kind: 'all' } | { kind: 'day'; dayKey: string; label: string } | null;

function RowThumbnail({ record }: { record: BulkImageRecord }) {
  const [failed, setFailed] = useState(false);
  return (
    <ImagePreview
      image={record.url}
      className="space-y-0"
      renderTrigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="group relative block h-12 w-12 overflow-hidden rounded-md border bg-slate-50"
          aria-label={record.fileName}
        >
          {failed ? (
            <span className="flex h-full w-full items-center justify-center text-mute">
              <ImageOff size={18} />
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={record.url}
              alt=""
              loading="lazy"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          )}
        </button>
      )}
    />
  );
}

function RowCopyButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(url)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="rounded-md p-2 text-mute transition-colors hover:bg-gray-100 hover:text-foreground"
      aria-label={label}
      title={label}
    >
      {copied ? <Check size={16} className="text-help-green" /> : <Copy size={16} />}
    </button>
  );
}

export function UploadHistory({ records, now }: Props) {
  const t = useTranslations('bulkImageUpload.history');
  const locale = useLocale();
  const dayKeys = useMemo(() => getRetainedDayKeys(now), [now]);
  const [activeDay, setActiveDay] = useState(dayKeys[0]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  // If midnight passes, the old "today" key drops out; fall back to today.
  const currentDay = dayKeys.includes(activeDay) ? activeDay : dayKeys[0];

  const byDay = useMemo(() => {
    const map = new Map<string, BulkImageRecord[]>(dayKeys.map((k) => [k, []]));
    for (const r of records) map.get(toDayKey(new Date(r.uploadedAt)))?.push(r);
    return map;
  }, [records, dayKeys]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
    [locale],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }),
    [locale],
  );

  const dayLabel = (key: string, index: number) => {
    if (index === 0) return t('tabs.today');
    if (index === 1) return t('tabs.yesterday');
    const [y, m, d] = key.split('-').map(Number);
    return dateFormatter.format(new Date(y, m - 1, d));
  };

  const tabs = dayKeys.map((key, index) => ({
    value: key,
    label: `${dayLabel(key, index)} (${byDay.get(key)?.length ?? 0})`,
  }));

  const dayRecords = byDay.get(currentDay) ?? [];
  const query = search.trim().toLowerCase();
  const visible = query
    ? dayRecords.filter(
        (r) => r.fileName.toLowerCase().includes(query) || r.url.toLowerCase().includes(query),
      )
    : dayRecords;
  const currentLabel = dayLabel(currentDay, dayKeys.indexOf(currentDay));

  const copyAll = async () => {
    if (!visible.length) return;
    const ok = await copyText(visible.map((r) => r.url).join('\n'));
    if (ok) toast.success(t('toasts.copiedAll', { count: visible.length }));
    else toast.error(t('toasts.copyFailed'));
  };

  const downloadCsv = () => {
    if (!visible.length) return;
    downloadTextFile(toCsv(visible), `bulk-image-urls-${currentDay}.csv`);
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const ok = confirm.kind === 'all' ? clearAllHistory() : clearHistoryDay(confirm.dayKey);
    if (ok) {
      toast.success(confirm.kind === 'all' ? t('toasts.clearedAll') : t('toasts.clearedDay'));
    } else {
      toast.error(t('toasts.storageError'));
    }
    setConfirm(null);
  };

  return (
    <section className="rounded-xl border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
          <p className="mt-1 text-sm text-mute">
            {t('subtitle', { total: records.length, days: BULK_IMAGE_HISTORY_DAYS })}
          </p>
        </div>
        <AppButton
          variant="mute"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          disabled={!records.length}
          onClick={() => setConfirm({ kind: 'all' })}
        >
          {t('clearAll')}
        </AppButton>
      </div>

      <Tabs value={currentDay} onValueChange={setActiveDay} className="mt-4">
        <ScrollableTabsNav tabs={tabs} value={currentDay} onChange={setActiveDay} />
        <TabsContent value={currentDay} className="mt-3 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput
              text={search}
              onChangeText={setSearch}
              placeholder={t('searchPlaceholder')}
              containerClass="w-full lg:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                leftIcon={<Copy size={14} />}
                disabled={!visible.length}
                onClick={copyAll}
              >
                {t('copyAll', { count: visible.length })}
              </AppButton>
              <AppButton
                variant="mute"
                size="sm"
                leftIcon={<Download size={14} />}
                disabled={!visible.length}
                onClick={downloadCsv}
              >
                {t('downloadCsv')}
              </AppButton>
              <AppButton
                variant="mute"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                disabled={!dayRecords.length}
                onClick={() => setConfirm({ kind: 'day', dayKey: currentDay, label: currentLabel })}
              >
                {t('clearDay')}
              </AppButton>
            </div>
          </div>

          <div className="overflow-auto rounded-md border">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-accent">
                <TableRow>
                  <TableHead className="w-[72px]">{t('columns.image')}</TableHead>
                  <TableHead>{t('columns.fileName')}</TableHead>
                  <TableHead>{t('columns.url')}</TableHead>
                  <TableHead className="w-[90px]">{t('columns.time')}</TableHead>
                  <TableHead className="w-[150px] text-right">{t('columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!visible.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4">
                      <NoDataFound
                        title={query ? t('empty.searchTitle') : t('empty.title')}
                        subtitle={query ? t('empty.searchSubtitle') : t('empty.subtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <RowThumbnail record={record} />
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <p className="truncate font-medium text-foreground" title={record.fileName}>
                          {record.fileName}
                        </p>
                        <p className="text-xs text-mute">{formatFileSize(record.size)}</p>
                      </TableCell>
                      <TableCell className="max-w-[360px]">
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate font-mono text-xs text-primary hover:underline"
                          title={record.url}
                        >
                          {record.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-mute">
                        {timeFormatter.format(new Date(record.uploadedAt))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <ImagePreview
                            image={record.url}
                            className="space-y-0"
                            renderTrigger={(open) => (
                              <button
                                type="button"
                                onClick={open}
                                className="rounded-md p-2 text-mute transition-colors hover:bg-gray-100 hover:text-foreground"
                                aria-label={t('actions.preview')}
                                title={t('actions.preview')}
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          />
                          <RowCopyButton url={record.url} label={t('actions.copy')} />
                          <button
                            type="button"
                            onClick={() => {
                              if (!removeFromHistory(record.id)) toast.error(t('toasts.storageError'));
                            }}
                            className="rounded-md p-2 text-mute transition-colors hover:bg-help-red/10 hover:text-help-red"
                            aria-label={t('actions.clear')}
                            title={t('actions.clear')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-mute">{t('note')}</p>
        </TabsContent>
      </Tabs>

      <AppAlertDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        variant="delete"
        title={confirm?.kind === 'all' ? t('confirm.allTitle') : t('confirm.dayTitle')}
        subTitle={
          confirm?.kind === 'day'
            ? t('confirm.daySubtitle', { day: confirm.label })
            : t('confirm.allSubtitle')
        }
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
