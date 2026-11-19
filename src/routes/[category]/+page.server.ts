import { error } from '@sveltejs/kit';
import { fetchCategories, fetchCategoryArticles } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  const category = params.category;

  const [catResult, categories] = await Promise.all([
    fetchCategoryArticles(fetch, category, 24),
    fetchCategories(fetch)
  ]);

  if (
    catResult.status === 404 ||
    !catResult.data ||
    !Array.isArray(catResult.data.articles) ||
    catResult.data.articles.length === 0
  ) {
    throw error(404, `Category "${category}" not found.`);
  }

  setHeaders({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });

  return {
    category: catResult.data.category || category,
    categoryLabel: catResult.data.categoryLabel || category,
    totalInCategory: catResult.data.totalInCategory ?? catResult.data.articles.length,
    articles: catResult.data.articles,
    categories
  };
};
