import { fetchCategories, fetchRandomArticles } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });

  const randomData = await fetchRandomArticles(fetch, 24);
  const articles = randomData?.articles ?? [];
  let categories = randomData?.categories ?? [];

  if (categories.length === 0) {
    categories = await fetchCategories(fetch);
  }

  return {
    articles,
    categories,
    featuredCategory: randomData?.category || '',
    featuredCategoryLabel: randomData?.categoryLabel || ''
  };
};
