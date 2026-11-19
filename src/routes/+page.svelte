<script lang="ts">
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import CategoryBar from '$lib/components/CategoryBar.svelte';
  import { buildHomepageJsonLd, serializeJsonLd } from '$lib/seo';
  import type { PageData } from './$types';

  export let data: PageData;

  $: jsonLd = serializeJsonLd(buildHomepageJsonLd(data.origin, data.siteTitle, data.articles));
  $: jsonLdTag = `<script id="json-ld-schema" type="application/ld+json">${jsonLd}<\/script>`;
</script>

<svelte:head>
  <title>{data.siteTitle} — Technical Specifications &amp; Diagrams</title>
  <link rel="canonical" href="{data.origin}/" />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta
    name="description"
    content="Explore verified technical specifications, reference articles, and diagrams on {data.siteTitle}."
  />
  {@html jsonLdTag}
</svelte:head>

<section class="page-intro">
  <h1>
    {data.featuredCategoryLabel
      ? `${data.featuredCategoryLabel} — Latest Articles`
      : `${data.siteTitle} — Latest Articles`}
  </h1>
  <p>
    Browse technical specifications, schematics, and reference guides curated across all active
    categories.
  </p>
</section>

<section class="article-grid" aria-label="Featured Articles">
  {#each data.articles as article (`${article.category}/${article.slug}`)}
    <ArticleCard {article} />
  {/each}
</section>

<CategoryBar categories={data.categories} activeCategory="" />
