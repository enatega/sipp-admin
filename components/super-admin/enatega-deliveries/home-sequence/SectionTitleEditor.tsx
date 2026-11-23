'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Pencil, RotateCcw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Mirrors the server's limit for a custom section title. */
const TITLE_MAX_LENGTH = 60;

type Props = {
  /** The built-in title customers see when no custom one is set. */
  defaultTitle: string;
  customTitle?: string;
  isHidden?: boolean;
  isBusy: boolean;
  /** Saves the custom title; `null` restores the default. */
  onSave: (title: string | null) => void;
};

/**
 * A home section's title in the Home Sequence editor, renamable in place. The title customers see
 * is the custom one when set, otherwise the default; both app and web show it once published.
 */
export function SectionTitleEditor({ defaultTitle, customTitle, isHidden, isBusy, onSave }: Props) {
  const t = useTranslations('homeSequenceEditor');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const shownTitle = customTitle || defaultTitle;

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  function startEditing() {
    setDraft(shownTitle);
    setIsEditing(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = draft.replace(/\s+/g, ' ').trim();
    setIsEditing(false);
    // Saving the default text (or nothing) means "use the default", not a custom copy of it.
    const title = next && next !== defaultTitle ? next : null;
    if (title !== (customTitle || null)) onSave(title);
  }

  if (isEditing) {
    return (
      <form className="flex min-w-0 flex-1 items-center gap-1" onSubmit={submit}>
        <input
          ref={inputRef}
          aria-label={t('titleLabel', { name: defaultTitle })}
          className="min-w-0 flex-1 rounded-lg border border-sky-600 px-2 py-1 text-base font-bold outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Escape') setIsEditing(false); }}
          placeholder={defaultTitle}
          value={draft}
        />
        <button type="submit" aria-label={t('saveTitle')} title={t('saveTitle')} className="grid size-8 shrink-0 place-items-center rounded-lg text-sky-700 hover:bg-sky-50"><Check size={16} /></button>
        <button type="button" onClick={() => setIsEditing(false)} aria-label={t('cancelTitle')} title={t('cancelTitle')} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={16} /></button>
      </form>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <h3 className={`min-w-0 truncate text-base font-bold ${isHidden ? 'text-slate-500' : ''}`} title={customTitle ? t('customTitleHint', { name: defaultTitle }) : undefined}>
        {shownTitle}
      </h3>
      <button type="button" disabled={isBusy} onClick={startEditing} aria-label={t('renameSection', { name: shownTitle })} title={t('renameSection', { name: shownTitle })} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Pencil size={14} /></button>
      {customTitle ? (
        <button type="button" disabled={isBusy} onClick={() => onSave(null)} aria-label={t('resetTitle', { name: defaultTitle })} title={t('resetTitle', { name: defaultTitle })} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"><RotateCcw size={14} /></button>
      ) : null}
    </div>
  );
}
