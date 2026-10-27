import { z } from 'zod';
import {
  confirmacionContrasena,
  contrasenaNueva,
  contrasenasIguales,
} from './esquemaContrasena';

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
 * El backend responde 400 tanto por la contraseña como por el enlace, sin decir cuál. Los del
 * enlace se reconocen por cómo empiezan, según src/modulos/cuentas/recuperacion-contrasena.service.ts
 * («El enlace de recuperación no es válido…») y el DTO RestablecerContrasenaDto («El token del
 * enlace…»). Si el backend agrega un código de error, esto se reemplaza.
 */
export const esErrorDelEnlace = (mensaje: string) =>
  mensaje.startsWith('El enlace') || mensaje.startsWith('El token');

const INICIOS: [inicio: string, campo: CampoRestablecer][] = [
  ['Las contraseñas no coinciden', 'confirmacionContrasena'],
  ['La confirmación de la contraseña', 'confirmacionContrasena'],
  ['La contraseña', 'contrasena'],
];

/** El campo de un mensaje del backend, o `null` si no es de un campo. */
export const campoDelError = (mensaje: string): CampoRestablecer | null =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
