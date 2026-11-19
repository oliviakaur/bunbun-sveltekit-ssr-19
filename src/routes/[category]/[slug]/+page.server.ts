import { error } from '@sveltejs/kit';
import {
  fetchDomainsStatus,
  fetchRandomArticles,
  fetchSingleArticle,
  type ArticleSummaryCard
} from '$lib/api';
import type { PageServerLoad } from './$types';

export interface CrossDomainLink {
  title: string;
  categoryLabel: string;
  href: string;
  domain: string;
}

function normalizeOrigin(domainEntry: string): { origin: string; hostname: string } | null {
  const raw = domainEntry.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`);
    return { origin: parsed.origin, hostname: parsed.hostname.toLowerCase() };
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ params, url, fetch, setHeaders }) => {
  const { category, slug } = params;

  const [articleRes, relatedSameRes, relatedCrossRes, domainsRes] = await Promise.all([
    fetchSingleArticle(fetch, category, slug),
    fetchRandomArticles(fetch, 10),
    fetchRandomArticles(fetch, 5),
    fetchDomainsStatus(fetch)
  ]);

  if (
    articleRes.status === 404 ||
    !articleRes.data ||
    !Array.isArray(articleRes.data.sentences) ||
    articleRes.data.sentences.length === 0
  ) {
    throw error(404, 'Article not found.');
  }

  setHeaders({
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
  });

  const relatedPosts: ArticleSummaryCard[] = (relatedSameRes?.articles ?? []).filter(
    (item) => item.slug !== slug
  );

  const currentHost = url.hostname.toLowerCase();
  const externalDomains = (domainsRes?.activeDomains ?? [])
    .map(normalizeOrigin)
    .filter((d): d is { origin: string; hostname: string } => Boolean(d && d.hostname !== currentHost));

  const crossDomainLinks: CrossDomainLink[] =
    externalDomains.length > 0
      ? (relatedCrossRes?.articles ?? []).slice(0, 5).map((item, idx) => {
          const target = externalDomains[idx % externalDomains.length];
          return {
            title: item.title,
            categoryLabel: item.categoryLabel || item.category,
            domain: target.hostname,
            href: `${target.origin}/?category=${encodeURIComponent(item.category)}&slug=${encodeURIComponent(item.slug)}`
          };
        })
      : [];

  return {
    article: articleRes.data,
    relatedPosts,
    crossDomainLinks
  };
};
