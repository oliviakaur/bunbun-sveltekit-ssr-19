import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNetlify from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function resolveAdapter() {
  const target = (process.env.ADAPTER || '').toLowerCase().trim();

  if (target === 'node') return adapterNode({ out: 'build' });
  if (target === 'cloudflare') return adapterCloudflare();
  if (target === 'netlify') return adapterNetlify();
  if (target === 'vercel') return adapterVercel({ runtime: 'nodejs20.x' });

  // Automatic platform environment detection
  if (process.env.CF_PAGES || process.env.WORKERS_CI) return adapterCloudflare();
  if (process.env.NETLIFY) return adapterNetlify();
  if (process.env.VERCEL) return adapterVercel({ runtime: 'nodejs20.x' });

  // Default to standalone Node server (Render, Azure App Service, Dokploy, Docker, VPS)
  return adapterNode({ out: 'build' });
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: resolveAdapter()
  }
};

export default config;
