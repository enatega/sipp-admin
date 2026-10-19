"use client";
import { useTranslations } from 'next-intl';
import type { AddressDetails } from '@/types/addressDetails';
interface Props { isHistoricalFallback?: boolean; details?: AddressDetails | null; legacyText?: string | null; compact?: boolean }
export function AddressDetailsView({ details, legacyText, compact = false, isHistoricalFallback = false }: Props) {
  const t = useTranslations('addressDetails');
  const keys = (['placeName', 'howToFindYou', 'deliveryInstructions'] as const).filter(key => details?.[key]?.trim());
  if (!keys.length && !legacyText?.trim() && !isHistoricalFallback) return null;
  const body = <dl className="mt-3 space-y-3 text-sm">{isHistoricalFallback ? <div><dt className="sr-only">{t("legacyDetails")}</dt><dd>{t("historicalFallback")}</dd></div> : null}{keys.map(key => <div key={key}><dt className="font-semibold">{t(`${key}Heading`)}</dt><dd className="whitespace-pre-wrap break-words">{details?.[key]}</dd></div>)}{!details && legacyText ? <div><dt className="font-semibold">{t('legacyDetails')}</dt><dd className="whitespace-pre-wrap break-words">{legacyText}</dd></div> : null}</dl>;
  return compact ? <details><summary className="cursor-pointer">{t('showDetails')}</summary>{body}</details> : body;
}
