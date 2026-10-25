import localFont from 'next/font/local';

/**
 * Fraunces (títulos) y DM Sans (texto), las tipografías de Figma. Se sirven desde el propio
 * sitio (paquetes @fontsource-variable): sin pedirlas a Google en cada visita y con métricas de
 * respaldo que evitan saltos al cargar (CLS, RNF-17). El archivo latin incluye tildes, ñ, ¿ ¡ y « ».
 */
export const fraunces = localFont({
  src: '../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--fuente-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const dmSans = localFont({
  src: '../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  weight: '100 1000',
  variable: '--fuente-dm-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
