<script lang="ts">
  import { resolveCardThumbnail, type ArticleSummaryCard } from '$lib/api';
  import { FALLBACK_IMG_SVG_DATA_URI } from '$lib/seo';

  export let article: ArticleSummaryCard;

  $: href = `/${encodeURIComponent(article.category)}/${encodeURIComponent(article.slug)}`;
  $: thumbUrl = resolveCardThumbnail(article);
  $: excerpt = article.excerpt || article.metaDesc || '';

  function handleImgError(event: Event) {
    const img = event.currentTarget as HTMLImageElement | null;
    if (!img || img.dataset.fallbackApplied === '1') return;
    img.dataset.fallbackApplied = '1';
    img.src = FALLBACK_IMG_SVG_DATA_URI;
  }
</script>

<article class="article-card">
  {#if thumbUrl}
    <a class="card-media" {href} tabindex="-1" aria-hidden="true">
      <img
        src={thumbUrl}
        alt={article.title}
        loading="lazy"
        decoding="async"
        width="400"
        height="250"
        on:error={handleImgError}
      />
    </a>
  {/if}
  <div class="card-body">
    <a class="card-category" href="/{encodeURIComponent(article.category)}">
      {article.categoryLabel || article.category}
    </a>
    <h2>
      <a {href}>{article.title}</a>
    </h2>
    {#if excerpt}
      <p class="card-excerpt">{excerpt}</p>
    {/if}
  </div>
</article>
