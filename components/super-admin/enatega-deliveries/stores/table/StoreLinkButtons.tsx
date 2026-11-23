'use client';

import { Globe, Megaphone, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { buildStoreLinks } from '@/lib/campaignLink';
import TooltipText from '@/components/shared/TooltipText';

const WEB_ORIGIN = process.env.NEXT_PUBLIC_CUSTOMER_WEB_URL || '';
const BRANCH_DOMAIN = process.env.NEXT_PUBLIC_BRANCH_LINK_DOMAIN || undefined;

const iconButton = 'inline-flex size-8 items-center justify-center rounded-md border shadow hover:bg-accent';

type LinkKind = 'webUrl' | 'appUrl' | 'campaignUrl';

/** Copy buttons for one store: the website link, the short app link, and the Branch campaign link for ads. */
export default function StoreLinkButtons({ storeId, storeName }: { storeId: string; storeName: string }) {
  const t = useTranslations('lumiFood.stores.links');
  if (!WEB_ORIGIN) return null;

  const copy = (kind: LinkKind, done: 'webCopied' | 'appCopied' | 'campaignCopied') => {
    const link = buildStoreLinks({ storeId, webOrigin: WEB_ORIGIN, branchDomain: BRANCH_DOMAIN })[kind];
    if (!link) return;
    navigator.clipboard.writeText(link)
      .then(() => toast.success(t(done)))
      .catch(() => toast.error(t('copyFailed')));
  };

  return (
    <div className="flex items-center gap-1.5">
      <TooltipText content={t('copyWeb')}>
        <button type="button" className={iconButton} onClick={() => copy('webUrl', 'webCopied')} aria-label={`${t('copyWeb')}: ${storeName}`}>
          <Globe size={16} />
        </button>
      </TooltipText>
      <TooltipText content={t('copyApp')}>
        <button type="button" className={iconButton} onClick={() => copy('appUrl', 'appCopied')} aria-label={`${t('copyApp')}: ${storeName}`}>
          <Smartphone size={16} />
        </button>
      </TooltipText>
      {BRANCH_DOMAIN ? (
        <TooltipText content={t('copyCampaign')}>
          <button type="button" className={iconButton} onClick={() => copy('campaignUrl', 'campaignCopied')} aria-label={`${t('copyCampaign')}: ${storeName}`}>
            <Megaphone size={16} />
          </button>
        </TooltipText>
      ) : null}
    </div>
  );
}
