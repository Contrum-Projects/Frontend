import { z } from 'zod';
import type { DatosFactura } from './consultasFacturas';

/**
 * Lo que revisa el backend al registrar la factura (`registrar-factura.dto.ts` y
 * `registrar-factura.service.ts`), con sus mismos mensajes, solo para avisar antes de enviar.
 * Quien decide es el backend: sus 400 y 409 llegan junto a cada campo.
 */
export const TAMANO_MAXIMO_FACTURA = 5 * 1024 * 1024;
const MAXIMO_INT4 = 2_147_483_647;

const MENSAJE_FOLIO = 'El folio debe ser un número entero positivo.';

export const esquemaFactura = z.object({
  folio: z
    .string()
    .trim()
    .min(1, 'Escribe el folio de la factura.')
    .regex(/^\d{1,10}$/, MENSAJE_FOLIO)
    .refine((valor) => {
      const numero = Number(valor);
      return numero >= 1 && numero <= MAXIMO_INT4;
    }, MENSAJE_FOLIO),
  fechaEmision: z.string().min(1, 'Elige la fecha de emisión.'),
  archivo: z
    .instanceof(File, { error: 'Adjunta el PDF de la factura.' })
    .nullable()
    .superRefine((archivo, contexto) => {
      if (!archivo) {
        contexto.addIssue({
          code: 'custom',
          message: 'Adjunta el PDF de la factura.',
        });
        return;
      }
      // El backend lo reconoce por su contenido; aquí solo se avisa lo evidente
      // Sin tipo (algunos sistemas no lo informan), basta con que el nombre termine en .pdf
      const esPdf = archivo.type
        ? archivo.type === 'application/pdf'
        : /\.pdf$/i.test(archivo.name);
      if (!esPdf) {
        contexto.addIssue({
          code: 'custom',
          message: 'La factura debe ser un archivo PDF.',
        });
      }
      if (archivo.size > TAMANO_MAXIMO_FACTURA) {
        contexto.addIssue({
          code: 'custom',
          message: 'La factura no puede superar los 5 MB.',
        });
      }
    }),
});

export type FormularioFactura = z.input<typeof esquemaFactura>;
export type CampoFactura = keyof FormularioFactura;

export const facturaInicial = (hoy: string): FormularioFactura => ({
  folio: '',
  fechaEmision: hoy,
  archivo: null,
});

export const datosFactura = (formulario: FormularioFactura): DatosFactura => ({
  folio: Number(formulario.folio.trim()),
  fechaEmision: formulario.fechaEmision,
  // El esquema ya exigió el archivo
  archivo: formulario.archivo as File,
});

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * mensaje sin campo, o de un campo que no está aquí, se muestra como aviso general.
 */
export const CAMPOS_FACTURA: Partial<Record<string, CampoFactura>> = {
  folio: 'folio',
  fechaEmision: 'fechaEmision',
  archivo: 'archivo',
};
