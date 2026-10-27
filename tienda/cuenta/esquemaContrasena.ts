import { z } from 'zod';

/**
 * Contraseña nueva del registro (E1-H1) y de la recuperación (E1-H4). Repite las reglas de
 * `ContrasenaNueva` del backend (src/common/validacion/contrasena.ts) solo para avisar antes de
 * enviar; el backend vuelve a validar.
 */
export const contrasenaNueva = z
  .string()
  .min(1, 'Escribe una contraseña.')
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña no puede superar los 128 caracteres.')
  .regex(/\p{L}/u, 'La contraseña debe tener al menos una letra.')
  .regex(/\d/, 'La contraseña debe tener al menos un número.');

export const confirmacionContrasena = z
  .string()
  .min(1, 'Repite tu contraseña.');

/** Para el `.refine` del formulario: el error queda en la confirmación. */
export const contrasenasIguales = {
  path: ['confirmacionContrasena'],
  message: 'Las contraseñas no coinciden.',
};
