import 'server-only';
import { z } from 'zod';

/**
 * Variables de entorno que solo lee el servidor de Next (Server Components, Route Handlers).
 * Agrega aquí cada variable nueva y también en .env.example. El frontend no guarda secretos:
 * si algo necesita una clave, va en el backend.
 */
const esquema = z.object({
  /** URL del backend, sin /api (p. ej. http://localhost:3000). */
  API_URL: z.url({
    message: 'API_URL debe ser una URL, p. ej. http://localhost:3000',
  }),
});

export type EntornoServidor = z.infer<typeof esquema>;

let entorno: EntornoServidor | undefined;

export function entornoServidor(): EntornoServidor {
  if (entorno) return entorno;
  const resultado = esquema.safeParse({
    API_URL:
      process.env.API_URL ??
      (process.env.NODE_ENV === 'production'
        ? undefined
        : 'http://localhost:3000'),
  });
  if (!resultado.success) {
    throw new Error(
      `Variables de entorno inválidas:\n${z.prettifyError(resultado.error)}`,
    );
  }
  entorno = { API_URL: resultado.data.API_URL.replace(/\/$/, '') };
  return entorno;
}

/**
 * API_SIMULADA=1 activa las rutas de compartido/api/simulado (docs/api-simulada.md). Nunca en
 * producción. Se lee en cada llamada (sin caché) para poder cambiarla en las pruebas.
 */
export function apiSimuladaActiva(): boolean {
  return (
    process.env.API_SIMULADA === '1' && process.env.NODE_ENV !== 'production'
  );
}
