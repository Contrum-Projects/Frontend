import { z } from 'zod';
import {
  confirmacionContrasena,
  contrasenaNueva,
  contrasenasIguales,
} from './esquemaContrasena';
import type { ErrorDeApi } from '@/compartido/api/errores';

/** «Recuperar contraseña» (E1-H4): el correo, como en el DTO SolicitarRecuperacionDto. */
export const esquemaSolicitud = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe tu correo.')
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .pipe(z.email('Escribe un correo válido.')),
});

export type DatosSolicitud = z.input<typeof esquemaSolicitud>;

/** «Nueva contraseña» (E1-H4): el token va aparte, no es un campo. */
export const esquemaRestablecer = z
  .object({ contrasena: contrasenaNueva, confirmacionContrasena })
  .refine(
    (datos) => datos.contrasena === datos.confirmacionContrasena,
    contrasenasIguales,
  );

export type DatosRestablecer = z.input<typeof esquemaRestablecer>;
export type CampoRestablecer = keyof DatosRestablecer;

/**
 * El mensaje del enlace que no sirve (vencido, usado o mal formado), o `null`: el backend lo
 * informa en el campo `token` (SCRUM-150), que la persona no escribe.
 */
export const errorDelEnlace = (error: ErrorDeApi): string | null =>
  error.errores.find(({ campo }) => campo === 'token')?.mensaje ?? null;

/** A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). */
export const CAMPOS_RESTABLECER: Partial<Record<string, CampoRestablecer>> = {
  contrasena: 'contrasena',
  confirmacionContrasena: 'confirmacionContrasena',
};
