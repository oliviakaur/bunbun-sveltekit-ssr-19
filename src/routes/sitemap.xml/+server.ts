import { getApiBase } from '$lib/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const db = url.searchParams.get('db')?.trim() || 'all';
  const limit = url.searchParams.get('limit')?.trim() || '500';
  const siteOrigin = url.origin;

  const upstreamUrl = `${getApiBase()}/sitemap.xml?domain=all&db=${encodeURIComponent(db)}&limit=${encodeURIComponent(limit)}`;

  const res = await fetch(upstreamUrl, {
    headers: { accept: 'application/xml, text/xml;q=0.9, */*;q=0.8' }
  });

  if (!res.ok) {
    const emptySitemap =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      `  <url><loc>${siteOrigin}/</loc></url>\n` +
      '</urlset>';
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  }

  const rawXml = await res.text();

  // Rewrite query-parameter URLs into clean friendly URLs on the active request origin
  const rewrittenXml = rawXml
    .replace(
      /<loc>https?:\/\/[^/<]+\/\?category=([^&<]+)&(?:amp;)?slug=([^<]+)<\/loc>/gi,
      (_match, cat, slug) => `<loc>${siteOrigin}/${cat}/${slug}</loc>`
    )
    .replace(
      /<loc>https?:\/\/[^/<]+\/\?category=([^&<]+)<\/loc>/gi,
      (_match, cat) => `<loc>${siteOrigin}/${cat}</loc>`
    )
    .replace(
      /<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/gi,
      (_match, pathPart) => `<loc>${siteOrigin}${pathPart}</loc>`
    );

  return new Response(rewrittenXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
};
