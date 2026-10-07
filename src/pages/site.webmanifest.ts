import type { APIRoute } from 'astro';
import { business } from '../data/business';

/** Web app manifest: home-screen name, colours and icons (icons from scripts/build-og-assets.mjs). */
export const GET: APIRoute = () => {
  const manifest = {
    name: business.name,
    short_name: business.name,
    description: `${business.tagline}. Cerrajería y portones eléctricos a domicilio, ${business.availability.long}.`,
    lang: 'es-CR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f5f1',
    theme_color: '#f5f5f1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
