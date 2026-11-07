import type { NextConfig } from 'next';

/**
 * Dominio público de las imágenes del catálogo (Cloudflare R2, el R2_URL_PUBLICA del backend).
 * Se lee al compilar: next/image solo optimiza imágenes de orígenes declarados aquí.
 */
const urlImagenes = process.env.URL_IMAGENES
  ? new URL(process.env.URL_IMAGENES)
  : null;

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // `next dev` abierto desde un túnel https (`cloudflared tunnel --url`) para probar el regreso
  // automático y el webhook de Mercado Pago: sin esto rechaza sus recursos de desarrollo (HMR)
  allowedDevOrigins: ['*.trycloudflare.com'],
  cacheComponents: true,
  partialPrefetching: true,
  // Los enlaces a rutas que no existen fallan en `pnpm typecheck`
  typedRoutes: true,
  // Imagen de Docker liviana (Dockerfile); Vercel lo ignora
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: urlImagenes
      ? [
          {
            protocol: urlImagenes.protocol.replace(':', '') as 'http' | 'https',
            hostname: urlImagenes.hostname,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: '/:ruta*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
      // Enlaces de los correos con token en la URL (E12-H1, E12-H2): sin Referer desde el primer
      // byte, también en las peticiones que salen antes de leer el <meta> de la página
      ...['/suscripcion/confirmar', '/ofertas/baja'].map((source) => ({
        source,
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      })),
    ];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
