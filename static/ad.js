/**
 * Responsive Sticky Bottom Ad Loader (Human Visitors Only)
 * - Mobile (< 768px): 320x50 banner
 * - Desktop (>= 768px): 300x250 banner
 *
 * Host this file externally (e.g., https://bunbunserver.my.id/ad.js) and set
 * PUBLIC_AD_SCRIPT_URL in your platform environment variables so you can rotate
 * AD_SERVER_BASE across all deployed sites without rebuilding SvelteKit.
 */
(function () {
  var AD_SERVER_BASE = 'https://hiibel.com/22/';

  var isMobile =
    window.innerHeight <= 60 ||
    (window.parent && typeof window.parent.innerWidth === 'number' && window.parent.innerWidth < 768);

  var cfg = isMobile
    ? { key: '659b04a20a0861b7619a7103d607c7d3', width: 320, height: 50 }
    : { key: 'a215683d2d0ce8fecd54e01b99606d75', width: 300, height: 250 };

  window.atOptions = {
    key: cfg.key,
    format: 'iframe',
    height: cfg.height,
    width: cfg.width,
    params: {}
  };

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = AD_SERVER_BASE + cfg.key;
  document.body.appendChild(script);
})();
