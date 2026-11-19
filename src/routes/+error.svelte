<script lang="ts">
  import { page } from '$app/stores';

  $: status = $page.status || 404;
  $: message = $page.error?.message || 'The requested page could not be found.';
  $: siteTitle = ($page.data?.siteTitle as string) || 'Site';
</script>

<svelte:head>
  <title>{status === 404 ? 'Page Not Found' : `Error ${status}`} - {siteTitle}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="error-page" aria-labelledby="error-heading">
  <div class="error-code">{status}</div>
  <h1 id="error-heading">{status === 404 ? 'Page Not Found' : 'Something Went Wrong'}</h1>
  <p>{message}</p>
  <a class="home-link" href="/">Return to Homepage</a>
</section>
