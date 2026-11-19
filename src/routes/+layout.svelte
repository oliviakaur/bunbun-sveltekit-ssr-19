<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import StickyBottomAd from '$lib/components/StickyBottomAd.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<Header siteTitle={data.siteTitle} />

<main class="site-main">
  <div class="site-container">
    <slot />
  </div>
</main>

<Footer siteTitle={data.siteTitle} />

{#if !data.isBot}
  <StickyBottomAd isBot={data.isBot} adScriptUrl={data.adScriptUrl} />
{/if}
