import type { CuerpoError } from './respuestas';

const MENSAJE_GENERICO =
  'No pudimos completar la acción. Intenta de nuevo en unos minutos.';

const MENSAJES_POR_ESTADO: Partial<Record<number, string>> = {
  401: 'Tu sesión terminó. Vuelve a ingresar.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No encontramos lo que buscas.',
  429: 'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
  502: 'No pudimos conectarnos con el servidor. Intenta de nuevo en unos minutos.',
};

/**
 * Error de la API con los mensajes del backend, que ya vienen en español y pensados para la
 * persona. Lo lanza `exigir()` y llega a TanStack Query como `error`.
 */
export class ErrorDeApi extends Error {
  constructor(
    readonly estado: number,
    readonly mensajes: string[],
    /** Segundos que pide esperar el backend (cabecera Retry-After en los 429). */
    readonly esperarSegundos?: number,
  ) {
    super(mensajes[0] ?? MENSAJE_GENERICO);
    this.name = 'ErrorDeApi';
  }
}

const esCuerpoError = (cuerpo: unknown): cuerpo is CuerpoError =>
  typeof cuerpo === 'object' &&
  cuerpo !== null &&
  'message' in cuerpo &&
  (typeof cuerpo.message === 'string' || Array.isArray(cuerpo.message));

/**
 * Mensajes en inglés que Nest pone por defecto: el `ThrottlerGuard` sin mensaje propio responde
 * «ThrottlerException: Too Many Requests» (registro, confirmación del correo). Se reemplazan por
 * el mensaje del estado.
 */
const esMensajeDeNest = (mensaje: string) =>
  mensaje.startsWith('ThrottlerException');

/** Convierte cualquier respuesta fallida (o un fallo de red) en `ErrorDeApi`. */
export function errorDeApi(cuerpo: unknown, respuesta?: Response): ErrorDeApi {
  const estado = respuesta?.status ?? 0;
  const espera = Number(respuesta?.headers.get('retry-after'));
  const mensajes =
    esCuerpoError(cuerpo) && estado < 500
      ? [cuerpo.message]
          .flat()
          .filter((mensaje) => mensaje && !esMensajeDeNest(mensaje))
      : [];
  return new ErrorDeApi(
    estado,
    mensajes.length > 0
      ? mensajes
      : [MENSAJES_POR_ESTADO[estado] ?? MENSAJE_GENERICO],
    Number.isFinite(espera) && espera > 0 ? espera : undefined,
  );
}

interface Resultado {
  data?: unknown;
  error?: unknown;
  response: Response;
}

type DatosDe<R extends Resultado> = Exclude<R['data'], undefined>;

/**
 * Devuelve los datos de una llamada de openapi-fetch o lanza `ErrorDeApi`.
 *
 *   const marcas = exigir(await api.GET('/api/catalogo/marcas'));
 *
 * Si el endpoint todavía no declara su respuesta en Swagger, indica el tipo
 * (de compartido/api/respuestas.ts):
 *
 *   const sesion = exigir<SesionIniciada>(await api.POST('/api/cuentas/sesion', { body }));
 */
export function exigir<R extends Resultado>(resultado: R): DatosDe<R>;
export function exigir<T>(resultado: Resultado): T;
export function exigir(resultado: Resultado): unknown {
  if (resultado.error !== undefined || !resultado.response.ok) {
    throw errorDeApi(resultado.error, resultado.response);
  }
  return resultado.data;
}
