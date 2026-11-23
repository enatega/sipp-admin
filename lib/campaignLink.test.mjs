import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildCampaignLinks, campaignLinkProblem } from './campaignLink.ts';

const STORE = '7e1f8a52-6d1c-4b43-9bb1-9f1f3d6a2e10';
const base = { storeId: STORE, channel: 'instagram', campaign: 'weekend_promo', webOrigin: 'https://www.sippdelivery.com', branchDomain: 'sipp.app.link' };

test('the website link carries the campaign as utm tags', () => {
  const url = new URL(buildCampaignLinks(base).webUrl);
  assert.equal(url.pathname, `/restaurants/${STORE}`);
  assert.equal(url.searchParams.get('utm_source'), 'instagram');
  assert.equal(url.searchParams.get('utm_medium'), 'link');
  assert.equal(url.searchParams.get('utm_campaign'), 'weekend_promo');
});

test('the Branch link opens the store in the app, counts the campaign, and falls back to the website link', () => {
  const links = buildCampaignLinks(base);
  const url = new URL(links.branchUrl);
  assert.equal(url.host, 'sipp.app.link');
  assert.equal(url.searchParams.get('$deeplink_path'), `/restaurants/${STORE}`);
  assert.equal(url.searchParams.get('~channel'), 'instagram');
  assert.equal(url.searchParams.get('~campaign'), 'weekend_promo');
  assert.equal(url.searchParams.get('~feature'), 'campaign');
  assert.equal(url.searchParams.get('$desktop_url'), links.webUrl);
  assert.equal(url.searchParams.has('$fallback_url'), false);
  assert.equal(url.searchParams.has('$og_redirect'), false);
});

test('a product is kept on both links', () => {
  const links = buildCampaignLinks({ ...base, productId: 'abc-123' });
  assert.equal(new URL(links.webUrl).searchParams.get('productId'), 'abc-123');
  assert.equal(new URL(links.branchUrl).searchParams.get('$deeplink_path'), `/restaurants/${STORE}?productId=abc-123`);
});

test('without a Branch domain only the website link is built', () => {
  assert.equal(buildCampaignLinks({ ...base, branchDomain: undefined }).branchUrl, null);
});

test('names that could carry anything but a plain word are refused', () => {
  for (const [field, value, problem] of [
    ['channel', 'a b', 'channel'], ['channel', 'name@example.com', 'channel'], ['campaign', '', 'campaign'], ['campaign', 'x'.repeat(61), 'campaign'],
    ['storeId', '../x', 'store'], ['productId', 'a/b', 'product'], ['webOrigin', 'http://insecure.example', 'origin'], ['webOrigin', 'nope', 'origin'], ['branchDomain', 'not a domain', 'domain'],
  ]) {
    assert.equal(campaignLinkProblem({ ...base, [field]: value }), problem, `${field}=${value}`);
    assert.throws(() => buildCampaignLinks({ ...base, [field]: value }));
  }
  assert.equal(campaignLinkProblem(base), null);
});

import { buildStoreLinks } from './campaignLink.ts';

test('the store list links: the website page, and the short app link that previews and opens the app on phones', () => {
  const links = buildStoreLinks({ storeId: STORE, webOrigin: 'https://www.sippdelivery.com' });
  assert.equal(links.webUrl, `https://www.sippdelivery.com/restaurants/${STORE}`);
  const app = new URL(links.appUrl);
  assert.equal(app.origin, 'https://www.sippdelivery.com');
  assert.equal(app.pathname, `/s/${STORE}`);
  assert.equal(app.searchParams.get('src'), 'admin_copy');
  assert.ok(links.appUrl.length < 120);
  assert.equal(links.campaignUrl, null);
});

test('the campaign link is a Branch link that opens the app, counts the campaign and falls back to the tagged website page', () => {
  const links = buildStoreLinks({ storeId: STORE, webOrigin: 'https://www.sippdelivery.com', branchDomain: 'sipp.app.link' });
  const url = new URL(links.campaignUrl);
  assert.equal(url.host, 'sipp.app.link');
  assert.equal(url.searchParams.get('$deeplink_path'), `/restaurants/${STORE}`);
  assert.equal(url.searchParams.get('~channel'), 'paid_ad');
  assert.equal(url.searchParams.get('~campaign'), 'store_promo');
  assert.equal(url.searchParams.get('~feature'), 'campaign');
  const web = new URL(url.searchParams.get('$desktop_url'));
  assert.equal(web.pathname, `/restaurants/${STORE}`);
  assert.equal(web.searchParams.get('utm_source'), 'paid_ad');
  assert.equal(web.searchParams.get('utm_campaign'), 'store_promo');
  // Ads want the app opened, so unlike the share link this one keeps Branch's default app opening.
  assert.equal(url.searchParams.has('$always_deeplink'), false);
});

test('a bad store ID or an insecure site is refused', () => {
  assert.throws(() => buildStoreLinks({ storeId: 'a/b', webOrigin: 'https://www.sippdelivery.com' }));
  assert.throws(() => buildStoreLinks({ storeId: STORE, webOrigin: 'http://insecure.example' }));
  assert.throws(() => buildStoreLinks({ storeId: STORE, webOrigin: 'https://www.sippdelivery.com', branchDomain: 'bad domain/' }));
});
