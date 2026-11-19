<script lang="ts">
  import {
    normalizeCategoryLabel,
    normalizeCategorySlug,
    type CategoryInfo
  } from '$lib/api';

  export let categories: CategoryInfo[] = [];
  export let activeCategory = '';
</script>

{#if categories.length > 0}
  <nav class="category-directory" aria-label="All Categories">
    <h2>Browse All Categories</h2>
    <ul>
      {#each categories as cat}
        {@const slug = normalizeCategorySlug(cat)}
        {@const label = normalizeCategoryLabel(cat)}
        {#if slug}
          <li>
            <a
              href="/{encodeURIComponent(slug)}"
              aria-current={activeCategory === slug ? 'page' : undefined}
            >
              <span>{label}</span>
              {#if typeof cat.count === 'number' || typeof cat.total === 'number'}
                <span class="cat-count">({cat.count ?? cat.total})</span>
              {/if}
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </nav>
{/if}
