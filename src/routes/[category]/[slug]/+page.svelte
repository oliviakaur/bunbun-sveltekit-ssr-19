<script lang="ts">
  import {
    buildArticleBreadcrumbJsonLd,
    buildArticleJsonLd,
    FALLBACK_IMG_SVG_DATA_URI,
    serializeJsonLd
  } from '$lib/seo';
  import type { ArticleImage } from '$lib/api';
  import type { PageData } from './$types';

  export let data: PageData;

  $: article = data.article;
  $: canonicalUrl = `${data.origin}/${encodeURIComponent(article.category)}/${encodeURIComponent(article.slug)}`;
  $: heroImage = article.images?.[0] ?? null;

  $: articleJsonLdTag = `<script id="json-ld-schema" type="application/ld+json">${serializeJsonLd(
    buildArticleJsonLd(data.origin, data.siteTitle, article)
  )}<\/script>`;

  $: breadcrumbJsonLdTag = `<script id="json-ld-breadcrumb" type="application/ld+json">${serializeJsonLd(
    buildArticleBreadcrumbJsonLd(data.origin, article)
  )}<\/script>`;

  type ContentBlock =
    | { kind: 'text'; text: string }
    | { kind: 'image'; image: ArticleImage; isHero: boolean };

  $: blocks = buildInterleavedBlocks(article.sentences || [], article.images || []);

  function buildInterleavedBlocks(sentences: string[], images: ArticleImage[]): ContentBlock[] {
    const out: ContentBlock[] = [];
    if (images.length === 0) {
      for (const s of sentences) out.push({ kind: 'text', text: s });
      return out;
    }

    // Place hero image right after the opening sentence, then interleave remaining images evenly
    const totalSentences = sentences.length;
    const step = Math.max(1, Math.floor(totalSentences / Math.max(1, images.length)));
    let imgIdx = 0;

    for (let i = 0; i < totalSentences; i++) {
      out.push({ kind: 'text', text: sentences[i] });
      if (imgIdx < images.length && (i === 0 || (i + 1) % step === 0)) {
        out.push({ kind: 'image', image: images[imgIdx], isHero: imgIdx === 0 });
        imgIdx++;
      }
    }

    while (imgIdx < images.length) {
      out.push({ kind: 'image', image: images[imgIdx], isHero: imgIdx === 0 });
      imgIdx++;
    }

    return out;
  }

  function handleImgError(event: Event) {
    const img = event.currentTarget as HTMLImageElement | null;
    if (!img || img.dataset.fallbackApplied === '1') return;
    img.dataset.fallbackApplied = '1';
    img.src = FALLBACK_IMG_SVG_DATA_URI;
  }
</script>

<svelte:head>
  <title>{article.title} - {article.categoryLabel} | {data.siteTitle}</title>
  <link rel="canonical" href={canonicalUrl} />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta name="description" content={article.metaDesc} />
  {#if article.metaKeywords}
    <meta name="keywords" content={article.metaKeywords} />
  {/if}
  {#if heroImage?.url}
    <link rel="preload" as="image" href={heroImage.url} fetchpriority="high" />
  {/if}
  {@html articleJsonLdTag}
  {@html breadcrumbJsonLdTag}
</svelte:head>

<article class="single-article">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/{encodeURIComponent(article.category)}">{article.categoryLabel}</a></li>
      <li aria-current="page">{article.title}</li>
    </ol>
  </nav>

  <header class="article-header">
    <h1>{article.title}</h1>
    <div class="article-meta">
      <span>Category: <a href="/{encodeURIComponent(article.category)}">{article.categoryLabel}</a></span>
      {#if article.updatedAt || article.createdAt}
        <time datetime={article.updatedAt || article.createdAt}>
          Updated {new Date(article.updatedAt || article.createdAt || '').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </time>
      {/if}
    </div>
  </header>

  <div class="article-body">
    {#each blocks as block}
      {#if block.kind === 'text'}
        <p>{block.text}</p>
      {:else}
        <figure>
          <img
            src={block.image.url}
            alt={block.image.alt || block.image.title || article.title}
            title={block.image.title || article.title}
            loading={block.isHero ? 'eager' : 'lazy'}
            decoding={block.isHero ? 'sync' : 'async'}
            fetchpriority={block.isHero ? 'high' : undefined}
            width={block.image.width || 800}
            height={block.image.height || 500}
            on:error={handleImgError}
          />
          {#if block.image.title || block.image.alt}
            <figcaption>{block.image.title || block.image.alt}</figcaption>
          {/if}
        </figure>
      {/if}
    {/each}
  </div>
</article>

{#if data.relatedPosts.length > 0}
  <section class="related-section" aria-labelledby="related-posts-heading">
    <h2 id="related-posts-heading">Related Articles</h2>
    <ul class="related-list">
      {#each data.relatedPosts as item (`${item.category}/${item.slug}`)}
        <li>
          <a href="/{encodeURIComponent(item.category)}/{encodeURIComponent(item.slug)}">
            {item.title}
          </a>
          <span class="related-meta">{item.categoryLabel || item.category}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#if data.crossDomainLinks.length > 0}
  <section class="related-section" aria-labelledby="cross-domain-heading">
    <h2 id="cross-domain-heading">Related Resources Across Our Network</h2>
    <ul class="related-list">
      {#each data.crossDomainLinks as link (link.href)}
        <li>
          <a href={link.href} rel="noopener">
            {link.title}
          </a>
          <span class="related-meta">{link.categoryLabel} &middot; {link.domain}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}
