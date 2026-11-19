<script lang="ts">
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import CategoryBar from '$lib/components/CategoryBar.svelte';
  import { buildCategoryJsonLd, serializeJsonLd } from '$lib/seo';
  import type { PageData } from './$types';

  export let data: PageData;

  $: canonicalUrl = `${data.origin}/${encodeURIComponent(data.category)}`;
  $: jsonLd = serializeJsonLd(
    buildCategoryJsonLd(
      data.origin,
      data.siteTitle,
      data.category,
      data.categoryLabel,
      data.articles
    )
  );
  $: jsonLdTag = `<script id="json-ld-schema" type="application/ld+json">${jsonLd}<\/script>`;
</script>

<svelte:head>
  <title>{data.categoryLabel} Specifications &amp; Diagrams | {data.siteTitle}</title>
  <link rel="canonical" href={canonicalUrl} />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta
    name="description"
    content="Browse {data.totalInCategory} verified technical articles and diagrams in {data.categoryLabel} on {data.siteTitle}."
  />
  {@html jsonLdTag}
</svelte:head>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li aria-current="page">{data.categoryLabel}</li>
  </ol>
</nav>

<section class="page-intro">
  <h1>{data.categoryLabel}</h1>
  <p>
    Showing {data.articles.length} of {data.totalInCategory} technical articles and diagrams in
    {data.categoryLabel}.
  </p>
</section>

<section class="article-grid" aria-label="{data.categoryLabel} Articles">
  {#each data.articles as article (`${article.category}/${article.slug}`)}
    <ArticleCard {article} />
  {/each}
</section>

<CategoryBar categories={data.categories} activeCategory={data.category} />
