import { env } from '$env/dynamic/public';
import { deriveSiteTitle } from '$lib/seo';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const origin = url.origin;
  const hostname = url.hostname;
  const siteTitle = deriveSiteTitle(hostname, env.PUBLIC_SITE_TITLE);
  const adScriptUrl = env.PUBLIC_AD_SCRIPT_URL?.trim() || '/ad.js';

  return {
    origin,
    hostname,
    siteTitle,
    isBot: Boolean(locals.isBot),
    adScriptUrl
  };
};
