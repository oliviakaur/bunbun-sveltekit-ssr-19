import type { Handle } from '@sveltejs/kit';
import { isSearchBot } from '$lib/seo';

export const handle: Handle = async ({ event, resolve }) => {
  const { url, request } = event;

  // Detect search bots on the server so human-only widgets never render in SSR HTML
  event.locals.isBot = isSearchBot(request.headers.get('user-agent') || '');

  // 301 redirect legacy cross-domain query URLs into clean friendly URLs
  if (url.pathname === '/') {
    const category = url.searchParams.get('category')?.trim();
    const slug = url.searchParams.get('slug')?.trim();

    if (category && slug) {
      return new Response(null, {
        status: 301,
        headers: {
          location: `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
          'cache-control': 'public, max-age=31536000, immutable'
        }
      });
    }

    if (category && !slug) {
      return new Response(null, {
        status: 301,
        headers: {
          location: `/${encodeURIComponent(category)}`,
          'cache-control': 'public, max-age=31536000, immutable'
        }
      });
    }
  }

  return resolve(event);
};
