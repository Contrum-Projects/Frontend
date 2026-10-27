import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { DireccionCuenta } from '@/compartido/api/respuestas';

/**
 * Formulario de dirección (E1-H5). Repite las reglas de
 * src/modulos/cuentas/dto/guardar-direccion.dto.ts del backend solo para avisar antes de
 * enviar. La comuna se elige de la lista oficial y se envía por su código CUT.
 */
export const esquemaDireccion = z.object({
  region: z.string().min(1, 'Elige una región.'),
  comuna: z.string().min(1, 'Elige una comuna.'),
  calle: z
    .string()
    .trim()
    .min(1, 'Escribe la calle.')
    .max(150, 'La calle no puede superar los 150 caracteres.'),
  numero: z
    .string()
    .trim()
    .min(1, 'Escribe el número.')
    .max(20, 'El número no puede superar los 20 caracteres.'),
  referencia: z
    .string()
    .trim()
    .max(255, 'La referencia no puede superar los 255 caracteres.'),
  esPrincipal: z.boolean(),
});

export type FormularioDireccion = z.input<typeof esquemaDireccion>;
export type SalidaDireccion = z.output<typeof esquemaDireccion>;
export type CampoDireccion = keyof FormularioDireccion;

export const DIRECCION_VACIA: FormularioDireccion = {
  region: '',
  comuna: '',
  calle: '',
  numero: '',
  referencia: '',
  esPrincipal: false,
};

export const direccionAFormulario = (
  direccion: DireccionCuenta,
): FormularioDireccion => ({
  region: direccion.comuna.region.codigoCut,
  comuna: direccion.comuna.codigoCut,
  calle: direccion.calle,
  numero: direccion.numero,
  referencia: direccion.referencia ?? '',
  esPrincipal: direccion.esPrincipal,
});

/**
 * Cuerpo de POST (nueva) y PATCH (edición). La principal se cambia con su propia ruta, así que
 * al editar no va. El Swagger declara `referencia` como `Record<string, never>`: por eso el cast.
 */
export const cuerpoNuevaDireccion = (datos: SalidaDireccion) =>
  ({
    calle: datos.calle,
    numero: datos.numero,
    comuna: datos.comuna,
    esPrincipal: datos.esPrincipal,
    ...(datos.referencia && { referencia: datos.referencia }),
  }) as components['schemas']['CrearDireccionDto'];

export const cuerpoEdicionDireccion = (datos: SalidaDireccion) =>
  ({
    calle: datos.calle,
    numero: datos.numero,
    comuna: datos.comuna,
    referencia: datos.referencia || null,
  }) as components['schemas']['ActualizarDireccionDto'];

/** Errores 400 del backend (sin campo) por cómo empiezan, como en erroresRegistro.ts. */
const INICIOS: [inicio: string, campo: CampoDireccion][] = [
  ['La calle', 'calle'],
  ['El número', 'numero'],
  ['La referencia', 'referencia'],
  ['La comuna', 'comuna'],
];

export const campoDelError = (mensaje: string): CampoDireccion | undefined =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1];
