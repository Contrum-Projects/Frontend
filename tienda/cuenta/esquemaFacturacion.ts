import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { formatearRut, normalizarRut } from '@/compartido/formato/rut';

const obligatorio = (maximo: number, vacio: string, etiqueta: string) =>
  z
    .string()
    .trim()
    .min(1, vacio)
    .max(maximo, `${etiqueta} no puede superar los ${maximo} caracteres.`);

/**
 * Formulario de datos de facturación (E9-H2). Repite las reglas de
 * src/modulos/cuentas/dto/guardar-datos-facturacion.dto.ts del backend solo para avisar antes de
 * enviar; el backend vuelve a validar. La comuna se elige de la lista oficial (código CUT).
 */
export const esquemaFacturacion = z.object({
  rut: z
    .string()
    .trim()
    .min(1, 'Escribe el RUT.')
    .refine((rut) => normalizarRut(rut) !== null, 'El RUT no es válido.'),
  razonSocial: obligatorio(150, 'Escribe la razón social.', 'La razón social'),
  giro: obligatorio(150, 'Escribe el giro.', 'El giro'),
  direccion: obligatorio(200, 'Escribe la dirección.', 'La dirección'),
  region: z.string().min(1, 'Elige una región.'),
  comuna: z.string().min(1, 'Elige una comuna.'),
  correoFacturacion: z
    .string()
    .trim()
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .refine(
      (correo) => correo === '' || z.email().safeParse(correo).success,
      'Escribe un correo válido.',
    ),
});

export type FormularioFacturacion = z.input<typeof esquemaFacturacion>;
export type SalidaFacturacion = z.output<typeof esquemaFacturacion>;
export type CampoFacturacion = keyof FormularioFacturacion;

export const FACTURACION_VACIA: FormularioFacturacion = {
  rut: '',
  razonSocial: '',
  giro: '',
  direccion: '',
  region: '',
  comuna: '',
  correoFacturacion: '',
};

export const facturacionAFormulario = (
  datos: DatosFacturacionCuenta,
): FormularioFacturacion => ({
  rut: formatearRut(datos.rut),
  razonSocial: datos.razonSocial,
  giro: datos.giro,
  direccion: datos.direccion,
  region: datos.comuna.region.codigoCut,
  comuna: datos.comuna.codigoCut,
  correoFacturacion: datos.correoFacturacion ?? '',
});

const camposComunes = (datos: SalidaFacturacion) => ({
  rut: normalizarRut(datos.rut) ?? datos.rut,
  razonSocial: datos.razonSocial,
  giro: datos.giro,
  direccion: datos.direccion,
  comuna: datos.comuna,
});

/**
 * Cuerpo de POST (nuevos) y PATCH (edición). Al editar, un correo vacío va como `null` para
 * borrarlo. El Swagger declara el correo como `Record<string, never>`: por eso el cast.
 */
export const cuerpoNuevaFacturacion = (datos: SalidaFacturacion) =>
  ({
    ...camposComunes(datos),
    ...(datos.correoFacturacion && {
      correoFacturacion: datos.correoFacturacion,
    }),
  }) as components['schemas']['CrearDatosFacturacionDto'];

export const cuerpoEdicionFacturacion = (datos: SalidaFacturacion) =>
  ({
    ...camposComunes(datos),
    correoFacturacion: datos.correoFacturacion || null,
  }) as components['schemas']['ActualizarDatosFacturacionDto'];

/** Errores 400 del backend (sin campo) por cómo empiezan, como en esquemaDireccion.ts. */
const INICIOS: [inicio: string, campo: CampoFacturacion][] = [
  ['El RUT', 'rut'],
  ['La razón social', 'razonSocial'],
  ['El giro', 'giro'],
  ['La dirección', 'direccion'],
  ['La comuna', 'comuna'],
  ['El correo', 'correoFacturacion'],
];

export const campoDelErrorFacturacion = (
  mensaje: string,
): CampoFacturacion | undefined =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1];
