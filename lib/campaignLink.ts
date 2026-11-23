// No imports: tested with plain Node.

export type CampaignLinkInput = {
  storeId: string;
  productId?: string;
  /** Where the link will be placed, for example "instagram", "flyer" or "qr_counter". */
  channel: string;
  /** The campaign name, for example "weekend_promo". */
  campaign: string;
  /** The customer website, for example https://www.sippdelivery.com. */
  webOrigin: string;
  /** The Branch link domain, for example sipp.app.link. Without it only the website link is built. */
  branchDomain?: string;
};

export type CampaignLinks = { webUrl: string; branchUrl: string | null };

const NAME = /^[A-Za-z0-9_-]{1,60}$/;
const ID = /^[A-Za-z0-9_-]{1,100}$/;
const DOMAIN = /^([a-z0-9-]+\.)+[a-z]{2,}$/i;

export type CampaignLinkProblem = 'store' | 'product' | 'channel' | 'campaign' | 'origin' | 'domain';

/** Returns what is wrong with the input, or null. Names are plain words, so they can never carry personal details. */
export function campaignLinkProblem(input: CampaignLinkInput): CampaignLinkProblem | null {
  if (!ID.test(input.storeId)) return 'store';
  if (input.productId && !ID.test(input.productId)) return 'product';
  if (!NAME.test(input.channel)) return 'channel';
  if (!NAME.test(input.campaign)) return 'campaign';
  try {
    if (new URL(input.webOrigin).protocol !== 'https:') return 'origin';
  } catch {
    return 'origin';
  }
  if (input.branchDomain && !DOMAIN.test(input.branchDomain)) return 'domain';
  return null;
}

/**
 * Two links for one placement. The website link carries the campaign as utm tags, so a visit is attributed on the
 * website. The Branch link opens the app when it is installed (and counts the install when it is not), carries the same
 * campaign as Branch tags, and shows the website link on a computer, and sends phones without the app to the store so the install counts for the campaign. Both name the store and, if given, a product.
 */
export function buildCampaignLinks(input: CampaignLinkInput): CampaignLinks {
  const problem = campaignLinkProblem(input);
  if (problem) throw new Error(`Invalid campaign link input: ${problem}`);
  const path = `/restaurants/${encodeURIComponent(input.storeId)}`;
  const web = new URL(path, input.webOrigin);
  if (input.productId) web.searchParams.set('productId', input.productId);
  web.searchParams.set('utm_source', input.channel);
  web.searchParams.set('utm_medium', 'link');
  web.searchParams.set('utm_campaign', input.campaign);
  const webUrl = web.toString();
  if (!input.branchDomain) return { webUrl, branchUrl: null };

  const deeplinkPath = input.productId ? `${path}?productId=${encodeURIComponent(input.productId)}` : path;
  const params: Array<[string, string]> = [
    ['$deeplink_path', deeplinkPath],
    // Computers get the website page. There is deliberately no $fallback_url: it would send phones without the app to the
    // website too, instead of the App Store or Play Store, and the install would not be attributed to the campaign.
    ['$desktop_url', webUrl],
    ['~channel', input.channel],
    ['~feature', 'campaign'],
    ['~campaign', input.campaign],
  ];
  const query = params.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return { webUrl, branchUrl: `https://${input.branchDomain}/?${query}` };
}

export type StoreLinkInput = { storeId: string; webOrigin: string; branchDomain?: string };
export type StoreLinks = {
  /** Opens the store on the website. */
  webUrl: string;
  /**
   * Opens the store in the app on a phone (through Branch, which counts the click and install) and the store page
   * elsewhere. It is a short address on the website that also shows the store name and picture when pasted into a
   * chat app, which a Branch link on its own does not do for every app.
   */
  appUrl: string;
  /** The Branch link for paid campaigns (see STORE_CAMPAIGN_DEFAULTS). Null without a Branch link domain. */
  campaignUrl: string | null;
};

/** Channel and campaign names on the campaign link copied from the stores list; they can be edited in the link. */
export const STORE_CAMPAIGN_DEFAULTS = { channel: 'paid_ad', campaign: 'store_promo' } as const;

/**
 * The links an operator copies from the stores list. All of them name only the store ID, so no personal detail can be in
 * them. The website serves the preview and decides where a visitor goes (see sipp-web lib/shareLink.ts). The campaign
 * link is a Branch link, so an ad click is counted in Branch and an app purchase reaches Branch (and Meta through it).
 */
export function buildStoreLinks(input: StoreLinkInput): StoreLinks {
  const problem = campaignLinkProblem({ storeId: input.storeId, ...STORE_CAMPAIGN_DEFAULTS, webOrigin: input.webOrigin, branchDomain: input.branchDomain });
  if (problem) throw new Error(`Invalid store link input: ${problem}`);
  const webUrl = new URL(`/restaurants/${encodeURIComponent(input.storeId)}`, input.webOrigin).toString();
  const appUrl = new URL(`/s/${encodeURIComponent(input.storeId)}`, input.webOrigin);
  appUrl.searchParams.set('src', 'admin_copy');
  const campaign = buildCampaignLinks({ storeId: input.storeId, ...STORE_CAMPAIGN_DEFAULTS, webOrigin: input.webOrigin, branchDomain: input.branchDomain });
  return { webUrl, appUrl: appUrl.toString(), campaignUrl: campaign.branchUrl };
}
