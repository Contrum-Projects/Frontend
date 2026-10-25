/**
 * Sesión del navegador (E1-H2, E1-H3, RNF-28).
 *
 * - El token de acceso vive solo en memoria: nunca en localStorage ni en cookies legibles.
 * - El token de refresco lo guarda el backend en una cookie httpOnly que solo viaja a
 *   /api/cuentas/sesion; el navegador la manda sola porque /api pasa por el proxy de Next
 *   (app/api/[...ruta]/route.ts) y queda en el mismo origen.
 * - Cada token de refresco sirve una vez, y si falla el backend borra la cookie. Por eso las
 *   renovaciones se hacen de a una, también entre pestañas (Web Locks): dos renovaciones a la vez
 *   con la misma cookie cerrarían la sesión.
 */
import type { SesionIniciada } from '@/compartido/api/respuestas';

export type EstadoSesion =
  | { tipo: 'desconocida' }
  | { tipo: 'anonima' }
  | { tipo: 'activa'; usuario: SesionIniciada['usuario'] };

const RUTA_RENOVAR = '/api/cuentas/sesion/renovar';
/** Se renueva un poco antes de que venza, para no mandar un token a punto de expirar. */
const MARGEN_MS = 30_000;

let estado: EstadoSesion = { tipo: 'desconocida' };
let token: { valor: string; venceEn: number } | null = null;
let renovacionEnCurso: Promise<string | null> | null = null;
const escuchas = new Set<() => void>();

function cambiar(nuevo: EstadoSesion) {
  estado = nuevo;
  escuchas.forEach((avisar) => avisar());
}

export function leerEstado(): EstadoSesion {
  return estado;
}

export function suscribir(escucha: () => void): () => void {
  escuchas.add(escucha);
  return () => escuchas.delete(escucha);
}

/** Guarda la sesión que entregan el inicio de sesión y la renovación. */
export function guardarSesion(sesion: SesionIniciada): void {
  token = {
    valor: sesion.tokenAcceso,
    venceEn: Date.now() + sesion.expiraEn * 1000,
  };
  cambiar({ tipo: 'activa', usuario: sesion.usuario });
}

/** Olvida la sesión en esta pestaña (tras cerrar sesión o cuando ya no se puede renovar). */
export function olvidarSesion(): void {
  token = null;
  cambiar({ tipo: 'anonima' });
}

/**
 * Token de acceso vigente, renovándolo si venció. `null` si no hay sesión.
 * Lo usa el cliente de la API antes de cada petición.
 */
export async function tokenVigente(): Promise<string | null> {
  if (token && Date.now() < token.venceEn - MARGEN_MS) return token.valor;
  if (estado.tipo === 'anonima') return null;
  return renovarSesion();
}

/**
 * Pide un token nuevo con la cookie de refresco. Si ya hay una renovación en curso,
 * espera esa en vez de lanzar otra.
 */
export function renovarSesion(): Promise<string | null> {
  renovacionEnCurso ??= conCandado(pedirRenovacion).finally(() => {
    renovacionEnCurso = null;
  });
  return renovacionEnCurso;
}

async function pedirRenovacion(): Promise<string | null> {
  try {
    const respuesta = await fetch(RUTA_RENOVAR, {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!respuesta.ok) {
      // 401: sin cookie o sesión cerrada/vencida. 429 u otro: no se adivina, se trata como anónima.
      olvidarSesion();
      return null;
    }
    const sesion = (await respuesta.json()) as SesionIniciada;
    guardarSesion(sesion);
    return sesion.tokenAcceso;
  } catch {
    // Sin conexión: se conserva el estado para reintentar en la próxima petición
    if (estado.tipo === 'desconocida') cambiar({ tipo: 'anonima' });
    return null;
  }
}

/** Ejecuta la renovación con un candado compartido por todas las pestañas del sitio. */
function conCandado<T>(tarea: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('cp-renovar-sesion', tarea);
  }
  return tarea();
}

/** Solo para pruebas: vuelve al estado inicial. */
export function reiniciarParaPruebas(): void {
  estado = { tipo: 'desconocida' };
  token = null;
  renovacionEnCurso = null;
  escuchas.clear();
}
