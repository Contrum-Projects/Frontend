/**
 * Respuestas de la API que el Swagger todavía no declara.
 *
 * `compartido/api/esquema.d.ts` tipa las rutas, los parámetros y los cuerpos de entrada (DTOs),
 * pero hoy ningún endpoint declara su respuesta (`@ApiOkResponse({ type })`), así que en el
 * esquema queda sin tipo. Mientras tanto, copia aquí el tipo desde el backend, citando el
 * archivo de origen, y bórralo cuando el endpoint lo declare y corras `pnpm api:tipos`.
 */
import type { Rol } from '@/compartido/sesion/roles';

/** backend: src/modulos/cuentas/sesion.service.ts › SesionIniciada */
export interface SesionIniciada {
  tokenAcceso: string;
  /** Segundos de vigencia del token de acceso. */
  expiraEn: number;
  usuario: {
    codigoPublico: string;
    nombre: string;
    apellido: string;
    rol: Rol;
  };
}

/** Cuerpo de error de NestJS. `message` es una lista cuando falla la validación de un DTO. */
export interface CuerpoError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
