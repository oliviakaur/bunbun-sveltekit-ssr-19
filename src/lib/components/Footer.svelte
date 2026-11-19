<script lang="ts">
  export let siteTitle: string;
  const year = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="site-container">
    <p>&copy; {year} {siteTitle}. All rights reserved.</p>
    <nav aria-label="Footer Links">
      <a href="/">Home</a>
      <a href="/sitemap.xml">XML Sitemap</a>
    </nav>
  </div>
</footer>
