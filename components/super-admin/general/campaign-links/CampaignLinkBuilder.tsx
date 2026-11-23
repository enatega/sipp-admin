'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { AppInputField } from '@/components/shared/form/AppInput';
import { buildCampaignLinks, campaignLinkProblem, type CampaignLinkInput } from '@/lib/campaignLink';

const WEB_ORIGIN = process.env.NEXT_PUBLIC_CUSTOMER_WEB_URL || '';
const BRANCH_DOMAIN = process.env.NEXT_PUBLIC_BRANCH_LINK_DOMAIN || undefined;

/**
 * Builds a tagged link and QR code for one placement (a post, a flyer, a counter sign). Everything is built in the
 * browser from plain words, so no customer detail can end up in a link. The Branch link counts installs and opens
 * the app; the website link is its fallback and counts visits.
 */
export function CampaignLinkBuilder() {
  const t = useTranslations('campaignLinks');
  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [channel, setChannel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [qr, setQr] = useState<string | null>(null);

  const input: CampaignLinkInput = { storeId: storeId.trim(), productId: productId.trim() || undefined, channel: channel.trim(), campaign: campaign.trim(), webOrigin: WEB_ORIGIN, branchDomain: BRANCH_DOMAIN };
  const problem = storeId || channel || campaign ? campaignLinkProblem(input) : 'store';
  const links = useMemo(() => (problem ? null : buildCampaignLinks(input)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, storeId, productId, channel, campaign]);
  const best = links?.branchUrl ?? links?.webUrl ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!best) { setQr(null); return; }
    void QRCode.toDataURL(best, { width: 512, margin: 2, errorCorrectionLevel: 'M' }).then((url) => { if (!cancelled) setQr(url); });
    return () => { cancelled = true; };
  }, [best]);

  const copy = (value: string) => { void navigator.clipboard.writeText(value).then(() => toast.success(t('copied'))); };

  return <div className="space-y-6">
    <Heading title={t('title')} />
    <p className="max-w-2xl text-sm text-muted-foreground">{t('description')}</p>
    {!WEB_ORIGIN && <p role="alert" className="text-sm text-destructive">{t('missingOrigin')}</p>}
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <AppInputField label={t('storeId')} value={storeId} onChange={(event) => setStoreId(event.target.value)} />
      <AppInputField label={t('productId')} value={productId} onChange={(event) => setProductId(event.target.value)} />
      <AppInputField label={t('channel')} helperText={t('channelHelp')} value={channel} onChange={(event) => setChannel(event.target.value)} />
      <AppInputField label={t('campaign')} helperText={t('campaignHelp')} value={campaign} onChange={(event) => setCampaign(event.target.value)} />
    </div>
    {(storeId || channel || campaign) && problem && problem !== 'origin' && <p role="status" className="text-sm text-muted-foreground">{t(`problems.${problem}`)}</p>}

    {links && <div className="max-w-2xl space-y-4">
      {links.branchUrl && <LinkRow label={t('appLink')} value={links.branchUrl} onCopy={copy} copyLabel={t('copy')} />}
      <LinkRow label={t('webLink')} value={links.webUrl} onCopy={copy} copyLabel={t('copy')} />
      {!links.branchUrl && <p className="text-xs text-muted-foreground">{t('noBranchDomain')}</p>}
      {qr && <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={t('qrAlt')} width={160} height={160} className="rounded-md border" />
        <a href={qr} download={`pohanch-${channel.trim()}-${campaign.trim()}.png`}>
          <AppButton type="button" leftIcon={<Download size={16} />}>{t('downloadQr')}</AppButton>
        </a>
      </div>}
    </div>}
  </div>;
}

function LinkRow({ label, value, onCopy, copyLabel }: { label: string; value: string; onCopy: (value: string) => void; copyLabel: string }) {
  return <div>
    <p className="mb-1 text-sm font-medium">{label}</p>
    <div className="flex items-start gap-2">
      <code className="block flex-1 break-all rounded-md border bg-accent p-2 text-xs">{value}</code>
      <AppButton type="button" variant="secondary" leftIcon={<Copy size={16} />} onClick={() => onCopy(value)}>{copyLabel}</AppButton>
    </div>
  </div>;
}
