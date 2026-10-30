/**
 * Cliente de la API para el navegador (Client Components y TanStack Query).
 *
 * Llama a /api/... en el mismo origen; app/api/[...ruta]/route.ts lo reenvía al backend.
 * Agrega el token de acceso y, si el backend responde 401, renueva la sesión una vez y repite
 * la petición. Rutas, parámetros y cuerpos están tipados desde el Swagger (esquema.d.ts).
 *
 *   const { data, error } = await api.GET('/api/cuentas/yo/direcciones');
 *   const marcas = exigir(await api.GET('/api/catalogo/marcas'));
 */
import createClient, { type Middleware } from 'openapi-fetch';
import {
  leerEstado,
  olvidarSesion,
  renovarSesion,
  tokenVigente,
} from '@/compartido/sesion/almacen';
import type { paths } from './esquema';

/** Iniciar, renovar y cerrar sesión usan la cookie de refresco, no el token de acceso. */
const RUTAS_CON_COOKIE = new Set([
  '/api/cuentas/sesion',
  '/api/cuentas/sesion/renovar',
]);
const esRutaDeSesion = (url: string) =>
  RUTAS_CON_COOKIE.has(new URL(url, 'http://x').pathname);

const copias = new Map<string, Request>();

/** Exportado para las pruebas; la app usa `api`. */
export const middlewareDeSesion: Middleware = {
  async onRequest({ request, id }) {
    if (esRutaDeSesion(request.url)) return request;
    const token = await tokenVigente();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    // Copia para repetirla si el token resulta revocado (RNF-28)
    if (token) copias.set(id, request.clone());
    return request;
  },
  async onResponse({ response, id }) {
    const copia = copias.get(id);
    copias.delete(id);
    if (response.status !== 401 || !copia || leerEstado().tipo !== 'activa') {
      return response;
    }
    const nuevo = await renovarSesion();
    if (!nuevo) {
      olvidarSesion();
      return response;
    }
    copia.headers.set('Authorization', `Bearer ${nuevo}`);
    return fetch(copia);
  },
  onError({ id }) {
    copias.delete(id);
  },
};

export const api = createClient<paths>({ baseUrl: '' });
api.use(middlewareDeSesion);

/**
 * Sin token, a propósito: para datos públicos que deben coincidir con lo que la tienda arma en
 * el servidor como visitante (p. ej. el total del botón de los filtros del catálogo).
 */
export const apiPublica = createClient<paths>({ baseUrl: '' });
