# SvelteKit SSR Multi-Platform & Multi-Domain Deployment Guide

This codebase is a true Server-Side Rendered (SSR) [SvelteKit](https://svelte.dev/docs/kit/adapters) frontend connected to `https://bunbunserver.my.id` (`PUBLIC_API_BASE`). A single Git repository deploys cleanly across **Render.com**, **Vercel**, **Netlify**, **Cloudflare Workers**, **Azure App Service**, and **Dokploy** using 4 official [Svelte CLI Adapters](https://svelte.dev/docs/cli/sveltekit-adapter).

## 1. Local Development & Testing

```bash
npm install
cp .env.example .env
npm run dev
```

To test production builds per adapter locally:

```bash
npm run build:node        # Render, Azure App Service, Dokploy, Docker/VPS
npm run build:vercel      # Vercel
npm run build:cloudflare  # Cloudflare Workers
npm run build:netlify     # Netlify
```

## 2. Multi-Domain Branding & Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PUBLIC_API_BASE` | `https://bunbunserver.my.id` | Backend API origin URL (no trailing slash). |
| `PUBLIC_SITE_TITLE` | *(blank)* | Leave blank to automatically derive the brand title from each request hostname (e.g., `example-auto.com` → **Example Auto**). |
| `PUBLIC_AD_SCRIPT_URL` | `/ad.js` | URL for the human-only responsive sticky bottom ad loader (`320x50` mobile / `300x250` desktop). Point to an external URL (e.g., `https://bunbunserver.my.id/ad.js`) to rotate ad domains across all sites without redeploying. |
| `ADAPTER` | auto / `node` | Explicit adapter override: `node`, `vercel`, `cloudflare`, or `netlify`. |
| `PROTOCOL_HEADER` | `x-forwarded-proto` | Required by `@sveltejs/adapter-node` behind reverse proxies (Render, Azure, Dokploy) for multi-domain `url.origin` resolution. |
| `HOST_HEADER` | `x-forwarded-host` | Required by `@sveltejs/adapter-node` so a single container serves multiple custom domains without hardcoding `ORIGIN`. |

> **Backend Allowlist:** Whenever you attach a new custom domain on any platform below, add it to `/backend/allowed_domains.txt` on `bunbunserver.my.id` so `GET /api/domains/status` includes it in cross-domain rotation.

## 3. Platform-by-Platform Deployment Instructions

### A. Vercel (`@sveltejs/adapter-vercel`)
- Docs: [SvelteKit on Vercel](https://vercel.com/docs/frameworks/full-stack/sveltekit) · [Vercel Adapter Docs](https://svelte.dev/docs/kit/adapter-vercel)
- Import your Git repository in Vercel. `svelte.config.js` auto-detects `process.env.VERCEL`.
- Set `PUBLIC_API_BASE=https://bunbunserver.my.id` (leave `PUBLIC_SITE_TITLE` empty for automatic per-domain titles).
- Attach multiple custom domains under **Project Settings → Domains**.

### B. Netlify (`@sveltejs/adapter-netlify`)
- Docs: [SvelteKit on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/sveltekit/) · [Netlify Adapter Docs](https://svelte.dev/docs/kit/adapter-netlify)
- Connect your Git repository in Netlify. `netlify.toml` runs `ADAPTER=netlify npm run build` and deploys SvelteKit routes as Netlify Functions.
- Add multiple custom domains or domain aliases under **Domain management**.

### C. Cloudflare Workers (`@sveltejs/adapter-cloudflare`)
- Docs: [SvelteKit on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/) · [Cloudflare Adapter Docs](https://svelte.dev/docs/kit/adapter-cloudflare) · [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- Build and deploy directly to Cloudflare Workers with Static Assets using `wrangler.toml`:
  ```bash
  ADAPTER=cloudflare npm run build
  npx wrangler deploy
  ```
- Attach multiple custom domains in the Cloudflare Dashboard under **Workers & Pages → Settings → Domains & Routes**.

### D. Render.com (`@sveltejs/adapter-node`)
- Docs: [Render Web Services](https://render.com/docs/web-services) · [Docker on Render](https://render.com/docs/docker)
- Deploy via Blueprint (`render.yaml`) or create a **Web Service** using the included multi-stage `Dockerfile`.
- Keep `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host` set (do **not** set a static `ORIGIN` if attaching multiple custom domains).

### E. Azure App Service (`@sveltejs/adapter-node`)
- Docs: [Configure a Custom Container - Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container) · [Azure Linux Node.js](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs)
- Build and push the `Dockerfile` to Azure Container Registry (or Docker Hub), then deploy to a **Linux Web App for Containers**.
- Set Application Settings:
  - `WEBSITES_PORT=3000`
  - `PUBLIC_API_BASE=https://bunbunserver.my.id`
  - `PROTOCOL_HEADER=x-forwarded-proto`
  - `HOST_HEADER=x-forwarded-host`
  - `ADDRESS_HEADER=x-forwarded-for`

### F. Dokploy (`@sveltejs/adapter-node`)
- Docs: [Dokploy Build Types](https://docs.dokploy.com/docs/core/applications/build-type) · [Dokploy Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- Create a new **Application** in Dokploy, link your Git repository, and select **Dockerfile** (or deploy via `docker-compose.yml`).
- Set Container Port to `3000` and add as many custom domains as needed in Dokploy's **Domains** tab—Traefik automatically provisions Let's Encrypt HTTPS certificates and forwards `x-forwarded-host` and `x-forwarded-proto`.

## 4. Rotating the Sticky Bottom Ad Domain Without Redeploying

The sticky bottom ad (`StickyBottomAd.svelte`) is excluded for search bots (SSR `User-Agent` filter + client `!navigator.webdriver`) and automatically loads `320×50` on mobile (`< 768px`) and `300×250` on desktop (`>= 768px`) via `static/ad.js`.

To update the ad-serving domain (`https://hiibel.com/22/`) across all deployed sites at once:
1. Host a copy of `static/ad.js` on your backend server (e.g., `https://bunbunserver.my.id/ad.js`) with `Cache-Control: public, max-age=300`.
2. Set `PUBLIC_AD_SCRIPT_URL=https://bunbunserver.my.id/ad.js` on your hosting platforms.
3. Edit `AD_SERVER_BASE` inside that single `ad.js` file whenever the ad domain changes.

## 5. Restyling a New Theme (Pure Semantic CSS)

Open `src/app.css` and modify only the `:root` custom properties at the top of the file:
- **Colors**: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`, `--color-border`
- **Typography**: `--font-heading`, `--font-body`, `--font-size-base`, `--line-height-heading`, `--line-height-body`
- **Design Properties**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--border-width`, `--shadow-offset-x`, `--shadow-offset-y`, `--shadow-blur`, `--shadow-color`
