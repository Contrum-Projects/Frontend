/**
 * API simulada para avanzar pantallas cuyo endpoint el backend aún no tiene.
 *
 * Con API_SIMULADA=1 (solo en desarrollo), el proxy /api y `apiServidor()` responden primero con
 * las rutas registradas en ./rutas.ts; lo que no está registrado sigue yendo al backend real.
 * Así una pantalla nueva funciona con datos de prueba y el resto del sitio usa la API de verdad.
 *
 * Reglas (docs/api-simulada.md):
 * - Simula solo endpoints que todavía no están en esquema.d.ts, con la forma acordada con quien
 *   hace la historia backend. Cuando el endpoint aparece, se borra la ruta simulada.
 * - Los datos de prueba no reemplazan reglas del backend: no calcules aquí lo que el backend
 *   decidirá (precios, IVA, stock, permisos); devuelve valores fijos.
 */
import 'server-only';
import { apiSimuladaActiva } from '@/compartido/config/entorno-servidor';
import { rutasSimuladas } from './rutas';

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ContextoSimulado {
  peticion: Request;
  /** Parámetros de la ruta: `/tienda/productos/:codigo` → `{ codigo }`. */
  params: Record<string, string>;
  /** URL completa, para leer la consulta (`url.searchParams`). */
  url: URL;
}

export interface RutaSimulada {
  metodo: MetodoHttp;
  /** Ruta sin el prefijo /api, con parámetros `:nombre`. Ej.: `/tienda/productos/:codigo`. */
  ruta: string;
  /** Historia de frontend que la usa, para saber cuándo borrarla. Ej.: `SCRUM-108`. */
  historia: `SCRUM-${number}`;
  /**
   * Devuelve `null` para dejar pasar la petición al backend: así se simula solo un parámetro
   * nuevo de un endpoint que ya existe (p. ej. `?orden=` en `/tienda/productos`).
   */
  responder: (
    contexto: ContextoSimulado,
  ) => Response | null | Promise<Response | null>;
}

/** Respuesta JSON, igual que las del backend. */
export function json(datos: unknown, status = 200): Response {
  return Response.json(datos, { status });
}

/** Error con la forma de los errores del backend (`{ statusCode, message }`). */
export function errorSimulado(
  status: number,
  message: string | string[],
): Response {
  return Response.json({ statusCode: status, message }, { status });
}

function coincide(
  patron: string,
  camino: string,
): Record<string, string> | null {
  const partesPatron = patron.split('/').filter(Boolean);
  const partesCamino = camino.split('/').filter(Boolean);
  if (partesPatron.length !== partesCamino.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < partesPatron.length; i++) {
    const p = partesPatron[i];
    const c = partesCamino[i];
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(c);
    else if (p !== c) return null;
  }
  return params;
}

/**
 * Responde con la ruta simulada que coincide con `camino` (sin /api), o devuelve null para que
 * la petición siga al backend. No hace nada si la API simulada no está activa.
 */
export async function responderSimulado(
  peticion: Request,
  camino: string,
  rutas: readonly RutaSimulada[] = rutasSimuladas,
): Promise<Response | null> {
  if (!apiSimuladaActiva()) return null;
  for (const ruta of rutas) {
    if (ruta.metodo !== peticion.method) continue;
    const params = coincide(ruta.ruta, camino);
    if (!params) continue;
    const respuesta = await ruta.responder({
      peticion,
      params,
      url: new URL(peticion.url),
    });
    if (!respuesta) continue;
    const salida = new Response(respuesta.body, respuesta);
    salida.headers.set('x-api-simulada', ruta.historia);
    return salida;
  }
  return null;
}
