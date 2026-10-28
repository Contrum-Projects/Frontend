import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { PreciosArticulo } from '@/compartido/api/respuestas';

/**
 * Precios netos de un artículo y el motivo del cambio (E3-H5). Repite los límites y los
 * mensajes de FijarPreciosDto del backend (src/modulos/catalogo/dto/fijar-precios.dto.ts) solo
 * para marcar lo que falta antes de enviar.
 */

/** Máximo de la columna `Decimal(12, 2)` de los precios netos. */
const MAXIMO_PRECIO_NETO = 9_999_999_999.99;
const MAXIMO_MOTIVO = 500;

/** «8403,36» o «8403.36»: en Chile se escribe con coma. */
const aNumero = (valor: string) => Number(valor.trim().replace(',', '.'));

const esPrecio = (valor: string) =>
  /^\d+([.,]\d{1,2})?$/.test(valor.trim()) &&
  aNumero(valor) > 0 &&
  aNumero(valor) <= MAXIMO_PRECIO_NETO;

/** Vacío deja el precio como está; si no, las mismas reglas que NumeroPositivo del backend. */
const precio = (etiqueta: string) =>
  z
    .string()
    .trim()
    .refine(
      (valor) => valor === '' || esPrecio(valor),
      `${etiqueta} debe ser un número con hasta dos decimales mayor que 0 y hasta ${MAXIMO_PRECIO_NETO}.`,
    );

export const esquemaPrecios = z
  .object({
    precioMinoristaNeto: precio('El precio minorista neto'),
    precioMayoristaNeto: precio('El precio mayorista neto'),
    motivo: z
      .string()
      .trim()
      .min(1, 'El motivo es obligatorio.')
      .max(
        MAXIMO_MOTIVO,
        `El motivo no puede superar los ${MAXIMO_MOTIVO} caracteres.`,
      ),
  })
  .refine(
    (datos) =>
      datos.precioMinoristaNeto !== '' || datos.precioMayoristaNeto !== '',
    {
      path: ['precioMayoristaNeto'],
      message: 'Indica el precio minorista, el mayorista o ambos.',
    },
  );

export type FormularioPrecios = z.input<typeof esquemaPrecios>;
export type SalidaPrecios = z.output<typeof esquemaPrecios>;
export type CampoPrecios = keyof FormularioPrecios;
export type CuerpoPrecios = components['schemas']['FijarPreciosDto'];

/** Los netos con coma, como se escriben en Chile. */
const aTexto = (cifra: number | null) =>
  cifra === null ? '' : String(cifra).replace('.', ',');

/** Parte de los precios vigentes; el motivo siempre se escribe de nuevo. */
export const preciosAFormulario = (
  precios: PreciosArticulo,
): FormularioPrecios => ({
  precioMinoristaNeto: precios.exclusivo
    ? ''
    : aTexto(precios.precioMinoristaNeto),
  precioMayoristaNeto: aTexto(precios.precioMayoristaNeto),
  motivo: '',
});

/**
 * Cuerpo del PUT: solo los precios que cambian (el que no llega no cambia). Un artículo
 * exclusivo no lleva precio minorista. `null` si ninguno cambió.
 */
export const cuerpoPrecios = (
  datos: SalidaPrecios,
  precios: PreciosArticulo,
): CuerpoPrecios | null => {
  const minorista =
    precios.exclusivo || datos.precioMinoristaNeto === ''
      ? undefined
      : aNumero(datos.precioMinoristaNeto);
  const mayorista =
    datos.precioMayoristaNeto === ''
      ? undefined
      : aNumero(datos.precioMayoristaNeto);
  const cambiaMinorista =
    minorista !== undefined && minorista !== precios.precioMinoristaNeto;
  const cambiaMayorista =
    mayorista !== undefined && mayorista !== precios.precioMayoristaNeto;
  if (!cambiaMinorista && !cambiaMayorista) return null;
  return {
    ...(cambiaMinorista && { precioMinoristaNeto: minorista }),
    ...(cambiaMayorista && { precioMayoristaNeto: mayorista }),
    motivo: datos.motivo,
  };
};

/**
 * Referencia mientras se escribe (E3-H5 criterio 1), con la tasa que entrega el backend. No es
 * el precio de venta: ese lo calcula el backend y llega en `precio…ConIva` al guardar. `null`
 * si el neto no es válido o el backend aún no entrega la tasa.
 */
export const vistaPreviaConIva = (
  neto: string,
  porcentajeIva: number | undefined,
): number | null => {
  if (porcentajeIva === undefined || !esPrecio(neto)) return null;
  return Math.round(aNumero(neto) * (1 + porcentajeIva / 100));
};

/**
 * Campos de un mensaje del backend, reconocidos por cómo empiezan (FijarPreciosDto y
 * precios.service.ts).
 */
const INICIOS_PRECIOS: [inicio: string, campo: CampoPrecios][] = [
  ['El precio minorista neto', 'precioMinoristaNeto'],
  ['El precio mayorista neto', 'precioMayoristaNeto'],
  ['El motivo', 'motivo'],
];

/** El campo de un mensaje del backend; `null` si no es de un campo. */
export const campoDelErrorPrecios = (mensaje: string): CampoPrecios | null =>
  INICIOS_PRECIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
