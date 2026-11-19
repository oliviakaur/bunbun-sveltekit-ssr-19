<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export let isBot = false;
  export let adScriptUrl = '/ad.js';

  let visible = false;
  let adWidth = 300;
  let adHeight = 250;
  let srcdoc = '';

  function escapeAttr(url: string): string {
    return url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildFrameDoc(scriptUrl: string): string {
    const safeUrl = escapeAttr(scriptUrl);
    return (
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center;width:100%;height:100%;}</style>' +
      '</head><body>' +
      `<script src="${safeUrl}"><\/script>` +
      '</body></html>'
    );
  }

  onMount(() => {
    if (isBot) return;
    if (typeof navigator !== 'undefined' && navigator.webdriver) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    adWidth = isMobile ? 320 : 300;
    adHeight = isMobile ? 50 : 250;
    srcdoc = buildFrameDoc(adScriptUrl || '/ad.js');
    visible = true;

    document.body.classList.add('has-sticky-ad');
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('has-sticky-ad');
    }
  });
</script>

{#if visible}
  <aside class="sticky-bottom-ad" aria-label="Advertisement">
    <iframe
      title="Advertisement"
      width={adWidth}
      height={adHeight}
      {srcdoc}
      scrolling="no"
      frameborder="0"
    ></iframe>
  </aside>
{/if}
