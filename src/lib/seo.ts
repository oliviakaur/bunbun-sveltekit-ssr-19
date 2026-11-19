import type { ArticleDetail, ArticleSummaryCard } from './api';

const BOT_UA_REGEX =
  /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|applebot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|gptbot|claudebot|bytespider|ccbot|lighthouse|pagespeed|headlesschrome|phantomjs|puppeteer|playwright/i;

export function isSearchBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_UA_REGEX.test(userAgent);
}

const MULTI_PART_TLDS = [
  '.my.id',
  '.co.id',
  '.web.id',
  '.biz.id',
  '.or.id',
  '.co.uk',
  '.org.uk',
  '.com.au',
  '.co.nz',
  '.co.jp',
  '.pages.dev',
  '.workers.dev',
  '.vercel.app',
  '.netlify.app',
  '.onrender.com',
  '.azurewebsites.net'
];

/**
 * Derives a clean human-readable site title from the request hostname when
 * PUBLIC_SITE_TITLE is not explicitly configured.
 * Example: "example-auto.com" -> "Example Auto"
 */
export function deriveSiteTitle(hostname: string, configuredTitle?: string): string {
  const explicit = configuredTitle?.trim();
  if (explicit) return explicit;

  let clean = (hostname || '').toLowerCase().trim();
  clean = clean.replace(/:\d+$/, '').replace(/^www\./, '');

  if (!clean || clean === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(clean)) {
    return 'Technical Specifications Hub';
  }

  let stripped = clean;
  let matchedMulti = false;
  for (const suffix of MULTI_PART_TLDS) {
    if (stripped.endsWith(suffix) && stripped.length > suffix.length) {
      stripped = stripped.slice(0, -suffix.length);
      matchedMulti = true;
      break;
    }
  }

  if (!matchedMulti) {
    const parts = stripped.split('.');
    if (parts.length > 1) {
      parts.pop();
      stripped = parts.join(' ');
    }
  }

  const words = stripped
    .split(/[-_.]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

  return words.length > 0 ? words.join(' ') : 'Technical Specifications Hub';
}

export function serializeJsonLd(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

export function buildHomepageJsonLd(
  origin: string,
  siteTitle: string,
  articles: ArticleSummaryCard[]
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: siteTitle
      },
      {
        '@type': 'ItemList',
        '@id': `${origin}/#itemlist`,
        name: `${siteTitle} Latest Articles`,
        numberOfItems: articles.length,
        itemListElement: articles.map((art, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: art.title,
          url: `${origin}/${encodeURIComponent(art.category)}/${encodeURIComponent(art.slug)}`
        }))
      }
    ]
  };
}

export function buildCategoryJsonLd(
  origin: string,
  siteTitle: string,
  category: string,
  categoryLabel: string,
  articles: ArticleSummaryCard[]
) {
  const categoryUrl = `${origin}/${encodeURIComponent(category)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${categoryUrl}#collection`,
        url: categoryUrl,
        name: `${categoryLabel} | ${siteTitle}`,
        isPartOf: { '@id': `${origin}/#website` }
      },
      {
        '@type': 'ItemList',
        '@id': `${categoryUrl}#itemlist`,
        name: `${categoryLabel} Articles`,
        numberOfItems: articles.length,
        itemListElement: articles.map((art, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: art.title,
          url: `${origin}/${encodeURIComponent(art.category || category)}/${encodeURIComponent(art.slug)}`
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${categoryUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryLabel,
            item: categoryUrl
          }
        ]
      }
    ]
  };
}

export function buildArticleJsonLd(origin: string, siteTitle: string, article: ArticleDetail) {
  const articleUrl = `${origin}/${encodeURIComponent(article.category)}/${encodeURIComponent(article.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDesc,
    articleSection: article.categoryLabel,
    articleBody: (article.sentences || []).join(' '),
    image: (article.images || []).map((img) => ({
      '@type': 'ImageObject',
      url: img.url,
      width: img.width || 800,
      height: img.height || 500,
      caption: img.title || img.alt || article.title
    })),
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      url: `${origin}/`
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    }
  };
}

export function buildArticleBreadcrumbJsonLd(origin: string, article: ArticleDetail) {
  const categoryUrl = `${origin}/${encodeURIComponent(article.category)}`;
  const articleUrl = `${categoryUrl}/${encodeURIComponent(article.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.categoryLabel,
        item: categoryUrl
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl
      }
    ]
  };
}

export const FALLBACK_IMG_SVG_DATA_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="22">Diagram Unavailable</text></svg>'
  );
