/**
 * Cliente de la API para el servidor de Next (Server Components, Route Handlers).
 *
 * Va directo al backend (API_URL), sin sesión: úsalo solo para datos públicos de la tienda
 * (catálogo, categorías, marcas), que así quedan en el HTML para buscadores (SEO).
 * Los datos de la cuenta, los precios de profesional y el panel se piden desde el navegador
 * con `api` de ./cliente, que lleva el token.
 *
 * Con Cache Components, cada lectura de la API se hace dentro de <Suspense> (o en una función
 * con 'use cache' y cacheLife): sin eso, `next build` intenta llamar al backend al compilar.
 * No caches precios ni stock en el frontend (RNF-30).
 */
import 'server-only';
import createClient from 'openapi-fetch';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import type { paths } from './esquema';
import { responderSimulado } from './simulado';

let cliente: ReturnType<typeof createClient<paths>> | undefined;

export function apiServidor() {
  cliente ??= createClient<paths>({
    baseUrl: entornoServidor().API_URL,
    fetch: async (peticion) => {
      // Solo en desarrollo con API_SIMULADA=1: endpoints que el backend aún no tiene.
      const camino = new URL(peticion.url).pathname.replace(/^\/api/, '');
      const simulada = await responderSimulado(peticion, camino);
      if (simulada) return simulada;
      // Si el backend no responde en 10 s, mejor mostrar el error que dejar la página colgada
      return fetch(peticion, { signal: AbortSignal.timeout(10_000) });
    },
  });
  return cliente;
}
