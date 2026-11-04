import { z } from 'zod';

/**
 * Suscripción a ofertas del footer (E12-H1): el correo, como en el DTO SuscribirseDto del
 * backend (máximo 254). El backend lo guarda en minúsculas.
 */
export const esquemaSuscripcion = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe tu correo.')
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .pipe(z.email('Escribe un correo válido.')),
});

export type DatosSuscripcion = z.input<typeof esquemaSuscripcion>;
export type SalidaSuscripcion = z.output<typeof esquemaSuscripcion>;
