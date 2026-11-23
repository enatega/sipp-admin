"use client";

import type { ComponentType, SVGProps } from "react";
import { Building2, ChevronDown, Info, MessageSquareText, Signpost } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AddressDetails } from "@/types/addressDetails";
import { ExpandableText } from "@/components/shared/ExpandableText";

interface Props {
  isHistoricalFallback?: boolean;
  details?: AddressDetails | null;
  legacyText?: string | null;
  compact?: boolean;
  className?: string;
}

type DetailKey = keyof AddressDetails;

const DETAIL_ROWS: ReadonlyArray<{ key: DetailKey; icon: ComponentType<SVGProps<SVGSVGElement>> }> = [
  { key: "placeName", icon: Building2 },
  { key: "howToFindYou", icon: Signpost },
  { key: "deliveryInstructions", icon: MessageSquareText },
];

interface RowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label?: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: RowProps) {
  const t = useTranslations("addressDetails");

  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      <span className="grid size-7 flex-none place-items-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        {label ? <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt> : null}
        <dd><ExpandableText text={value} moreLabel={t("showMore")} lessLabel={t("showLess")} className="text-sm leading-5 text-foreground" /></dd>
      </div>
    </div>
  );
}

export function AddressDetailsView({ details, legacyText, compact = false, className = "", isHistoricalFallback = false }: Props) {
  const t = useTranslations("addressDetails");
  const rows = DETAIL_ROWS.filter(({ key }) => details?.[key]?.trim());
  // Structured details remain authoritative, including intentionally cleared fields.
  const visibleLegacyText = details == null && legacyText?.trim() ? legacyText : null;
  const hasContent = rows.length > 0 || visibleLegacyText !== null;

  if (!hasContent && !isHistoricalFallback) return null;

  const content = (
    <dl className="min-w-0 divide-y overflow-hidden rounded-lg border bg-card">
      {rows.map(({ key, icon }) => (
        <DetailRow key={key} icon={icon} label={t(`${key}Heading`)} value={details?.[key]?.trim() ?? ""} />
      ))}
      {visibleLegacyText ? <DetailRow icon={Info} value={visibleLegacyText} /> : null}
    </dl>
  );

  return (
    <div className={`mt-2 min-w-0 text-sm leading-5 [overflow-wrap:anywhere] ${className}`}>
      {isHistoricalFallback ? (
        <details className="group">
          <summary className="cursor-pointer rounded-md py-2 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">{t("linkedAddress")}</summary>
          <p className="pb-2">{t("historicalFallback")}</p>
        </details>
      ) : null}
      {hasContent ? (
        compact ? (
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{t("showDetails")}</span>
              <span className="hidden group-open:inline">{t("hideDetails")}</span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
            </summary>
            <div className="pb-2">{content}</div>
          </details>
        ) : content
      ) : null}
    </div>
  );
}
