import { env } from '$env/dynamic/public';

export interface ArticleImage {
  title?: string;
  alt?: string;
  url: string;
  thumb?: string;
  filetype?: string;
  domain?: string;
  width?: number;
  height?: number;
}

export interface ArticleDetail {
  id: string | number;
  category: string;
  categoryLabel: string;
  keyword?: string;
  slug: string;
  title: string;
  content?: string;
  sentences: string[];
  images: ArticleImage[];
  imageCount: number;
  sentenceCount: number;
  metaDesc: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
  canonicalPath?: string;
}

export interface ArticleSummaryCard {
  id?: string | number;
  category: string;
  categoryLabel?: string;
  slug: string;
  title: string;
  excerpt?: string;
  metaDesc?: string;
  thumb?: string;
  image?: string;
  images?: ArticleImage[];
  createdAt?: string;
}

export interface CategoryInfo {
  slug?: string;
  category?: string;
  name?: string;
  label?: string;
  categoryLabel?: string;
  count?: number;
  total?: number;
}

export interface RandomArticlesResponse {
  articles: ArticleSummaryCard[];
  count: number;
  query?: string;
  category?: string;
  categoryLabel?: string;
  categories?: CategoryInfo[];
}

export interface CategoryArticlesResponse {
  category: string;
  categoryLabel: string;
  totalInCategory: number;
  articles: ArticleSummaryCard[];
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
  totalCategories: number;
}

export interface DomainsStatusResponse {
  activeCount: number;
  publicFrontendDomainCount: number;
  sampledCount: number;
  isSampled: boolean;
  activeDomains: string[];
}

export function getApiBase(): string {
  const configured = env.PUBLIC_API_BASE?.trim();
  return (configured || 'https://bunbunserver.my.id').replace(/\/+$/, '');
}

export function normalizeCategorySlug(cat: CategoryInfo): string {
  return (cat.slug || cat.category || cat.name || '').trim();
}

export function normalizeCategoryLabel(cat: CategoryInfo): string {
  return (cat.label || cat.categoryLabel || cat.name || cat.slug || cat.category || '').trim();
}

export function resolveCardThumbnail(art: ArticleSummaryCard): string {
  return art.thumb || art.image || art.images?.[0]?.thumb || art.images?.[0]?.url || '';
}

export async function fetchRandomArticles(
  fetchFn: typeof fetch,
  limit = 24
): Promise<RandomArticlesResponse | null> {
  const url = `${getApiBase()}/api/articles/random?limit=${limit}`;
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  return (await res.json()) as RandomArticlesResponse;
}

export async function fetchCategoryArticles(
  fetchFn: typeof fetch,
  category: string,
  limit = 24
): Promise<{ status: number; data: CategoryArticlesResponse | null }> {
  const url = `${getApiBase()}/api/category/${encodeURIComponent(category)}?limit=${limit}`;
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    return { status: res.status, data: null };
  }
  return { status: res.status, data: (await res.json()) as CategoryArticlesResponse };
}

export async function fetchCategories(fetchFn: typeof fetch): Promise<CategoryInfo[]> {
  const url = `${getApiBase()}/api/categories`;
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) return [];
  const data = (await res.json()) as CategoriesResponse;
  return Array.isArray(data.categories) ? data.categories : [];
}

export async function fetchSingleArticle(
  fetchFn: typeof fetch,
  category: string,
  slug: string
): Promise<{ status: number; data: ArticleDetail | null }> {
  const url = `${getApiBase()}/api/article/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    return { status: res.status, data: null };
  }
  return { status: res.status, data: (await res.json()) as ArticleDetail };
}

export async function fetchDomainsStatus(
  fetchFn: typeof fetch
): Promise<DomainsStatusResponse | null> {
  const url = `${getApiBase()}/api/domains/status`;
  const res = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  return (await res.json()) as DomainsStatusResponse;
}
