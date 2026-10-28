import { z } from 'zod';
import type { FormatoPanel, UnidadMedida } from '@/compartido/api/respuestas';

/**
 * Formato de venta nuevo o editado (E3-H2). Repite los límites y los mensajes de
 * CrearFormatoDto del backend (src/modulos/catalogo/dto/crear-formato.dto.ts y
 * formato.validadores.ts) solo para marcar lo que falta antes de enviar; si el SKU o el código
 * de barras están libres lo decide el backend (409).
 */

/** Máximos de las columnas `Decimal(10, 2)` (contenido) y `Decimal(7, 2)` (medidas). */
const MAXIMO_CONTENIDO = 99_999_999.99;
const MAXIMO_MEDIDA_CM = 99_999.99;
/** Máximo de un `int4` de PostgreSQL (peso y stock mínimo). */
const MAXIMO_ENTERO = 2_147_483_647;

export const UNIDADES: { valor: UnidadMedida; texto: string }[] = [
  { valor: 'ml', texto: 'ml' },
  { valor: 'g', texto: 'g' },
  { valor: 'unidades', texto: 'unidades' },
];

/** «18,5» o «18.5»: en Chile se escribe con coma. */
const aNumero = (valor: string) => Number(valor.trim().replace(',', '.'));

/** Número del formulario (texto) con las mismas reglas que NumeroPositivo del backend. */
const numero = ({
  etiqueta,
  decimales = false,
  admiteCero = false,
  maximo = MAXIMO_ENTERO,
}: {
  etiqueta: string;
  decimales?: boolean;
  admiteCero?: boolean;
  maximo?: number;
}) => {
  const formato = decimales ? /^\d+([.,]\d{1,2})?$/ : /^\d+$/;
  const tipo = decimales
    ? 'un número con hasta dos decimales'
    : 'un número entero';
  const desde = admiteCero ? 'desde 0' : 'mayor que 0';
  return z
    .string()
    .trim()
    .min(1, `${etiqueta} es obligatorio.`)
    .refine((valor) => {
      if (!formato.test(valor)) return false;
      const cifra = aNumero(valor);
      return (admiteCero ? cifra >= 0 : cifra > 0) && cifra <= maximo;
    }, `${etiqueta} debe ser ${tipo} ${desde} y hasta ${maximo}.`);
};

const MENSAJE_CONTENIDO = 'Indica el contenido junto con su unidad de medida.';

export const esquemaFormato = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1, 'El SKU es obligatorio.')
      .regex(
        /^[\x21-\x7E]{1,50}$/,
        'El SKU debe tener hasta 50 caracteres, sin espacios, tildes ni símbolos especiales.',
      ),
    codigoBarras: z
      .string()
      .trim()
      .refine(
        (valor) => valor === '' || /^(\d{8}|\d{12,14})$/.test(valor),
        'El código de barras debe tener 8, 12, 13 o 14 dígitos.',
      ),
    nombreFormato: z
      .string()
      .trim()
      .min(1, 'El nombre del formato es obligatorio.')
      .max(100, 'El nombre del formato no puede superar los 100 caracteres.'),
    contenido: z
      .string()
      .trim()
      .refine(
        (valor) =>
          valor === '' ||
          (/^\d+([.,]\d{1,2})?$/.test(valor) &&
            aNumero(valor) > 0 &&
            aNumero(valor) <= MAXIMO_CONTENIDO),
        `El contenido debe ser un número con hasta dos decimales mayor que 0 y hasta ${MAXIMO_CONTENIDO}.`,
      ),
    unidadMedida: z.enum(['', 'ml', 'g', 'unidades']),
    pesoGramos: numero({ etiqueta: 'El peso' }),
    altoCm: numero({
      etiqueta: 'El alto',
      decimales: true,
      maximo: MAXIMO_MEDIDA_CM,
    }),
    anchoCm: numero({
      etiqueta: 'El ancho',
      decimales: true,
      maximo: MAXIMO_MEDIDA_CM,
    }),
    largoCm: numero({
      etiqueta: 'El largo',
      decimales: true,
      maximo: MAXIMO_MEDIDA_CM,
    }),
    stockMinimo: numero({ etiqueta: 'El stock mínimo', admiteCero: true }),
    /** AAAA-MM-DD, o vacío si no vence. */
    fechaVencimiento: z.string(),
    esPredeterminado: z.boolean(),
  })
  // Contenido y unidad van juntos: el mensaje queda en el que falta
  .superRefine((datos, contexto) => {
    if (datos.contenido !== '' && datos.unidadMedida === '') {
      contexto.addIssue({
        code: 'custom',
        path: ['unidadMedida'],
        message: MENSAJE_CONTENIDO,
      });
    }
    if (datos.contenido === '' && datos.unidadMedida !== '') {
      contexto.addIssue({
        code: 'custom',
        path: ['contenido'],
        message: MENSAJE_CONTENIDO,
      });
    }
  });

export type FormularioFormato = z.input<typeof esquemaFormato>;
export type SalidaFormato = z.output<typeof esquemaFormato>;
export type CampoFormato = keyof FormularioFormato;

export const FORMATO_VACIO: FormularioFormato = {
  sku: '',
  codigoBarras: '',
  nombreFormato: '',
  contenido: '',
  unidadMedida: '',
  pesoGramos: '',
  altoCm: '',
  anchoCm: '',
  largoCm: '',
  stockMinimo: '0',
  fechaVencimiento: '',
  esPredeterminado: false,
};

/** Las medidas con coma, como se escriben en Chile. */
const aTexto = (cifra: number) => String(cifra).replace('.', ',');

export const formatoAFormulario = (
  formato: FormatoPanel,
): FormularioFormato => ({
  sku: formato.sku,
  codigoBarras: formato.codigoBarras ?? '',
  nombreFormato: formato.nombreFormato,
  contenido: formato.contenido === null ? '' : aTexto(formato.contenido),
  unidadMedida: formato.unidadMedida ?? '',
  pesoGramos: String(formato.pesoGramos),
  altoCm: aTexto(formato.altoCm),
  anchoCm: aTexto(formato.anchoCm),
  largoCm: aTexto(formato.largoCm),
  stockMinimo: String(formato.stockMinimo),
  fechaVencimiento: formato.fechaVencimiento ?? '',
  esPredeterminado: formato.esPredeterminado,
});

/**
 * Cuerpo de POST y PATCH. El Swagger tipa mal los campos que admiten `null` (codigoBarras,
 * contenido y fechaVencimiento salen como `Record<string, never>`), así que se usa este tipo,
 * igual a CrearFormatoDto del backend.
 */
export interface CuerpoFormato {
  sku: string;
  codigoBarras: string | null;
  nombreFormato: string;
  contenido: number | null;
  unidadMedida: UnidadMedida | null;
  fechaVencimiento: string | null;
  stockMinimo: number;
  pesoGramos: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  esPredeterminado?: true;
}

/**
 * Siempre se envían todos los datos; `null` borra lo opcional. `esPredeterminado` solo va
 * cuando se marca un formato que no lo era: el backend no deja desmarcar el predeterminado (se
 * marca otro).
 */
export const cuerpoFormato = (
  datos: SalidaFormato,
  eraPredeterminado = false,
): CuerpoFormato => ({
  sku: datos.sku,
  codigoBarras: datos.codigoBarras || null,
  nombreFormato: datos.nombreFormato,
  contenido: datos.contenido ? aNumero(datos.contenido) : null,
  unidadMedida: datos.unidadMedida || null,
  fechaVencimiento: datos.fechaVencimiento || null,
  stockMinimo: aNumero(datos.stockMinimo),
  pesoGramos: aNumero(datos.pesoGramos),
  altoCm: aNumero(datos.altoCm),
  anchoCm: aNumero(datos.anchoCm),
  largoCm: aNumero(datos.largoCm),
  ...(datos.esPredeterminado &&
    !eraPredeterminado && { esPredeterminado: true }),
});

/**
 * Campos de un mensaje del backend (la lista de mensajes no dice a qué campo pertenece). Se
 * reconocen por cómo empiezan, según CrearFormatoDto y formatos.service.ts. El 409 de SKU y
 * código repetidos a la vez marca los dos (E3-H2 criterio 2).
 */
const INICIOS_FORMATO: [inicio: string, campos: CampoFormato[]][] = [
  ['El SKU y el código de barras', ['sku', 'codigoBarras']],
  // Dos guardados simultáneos: el backend no sabe cuál de los dos se repitió
  ['El SKU o el código de barras', ['sku', 'codigoBarras']],
  ['El SKU', ['sku']],
  ['El código de barras', ['codigoBarras']],
  ['El nombre del formato', ['nombreFormato']],
  ['El contenido', ['contenido']],
  ['Indica el contenido', ['contenido', 'unidadMedida']],
  ['La unidad de medida', ['unidadMedida']],
  ['La fecha de vencimiento', ['fechaVencimiento']],
  ['El stock mínimo', ['stockMinimo']],
  ['El peso', ['pesoGramos']],
  ['El alto', ['altoCm']],
  ['El ancho', ['anchoCm']],
  ['El largo', ['largoCm']],
  ['El formato predeterminado', ['esPredeterminado']],
  ['El producto necesita un formato predeterminado', ['esPredeterminado']],
];

/** Los campos de un mensaje del backend; vacío si no es de un campo. */
export const camposDelErrorFormato = (mensaje: string): CampoFormato[] =>
  INICIOS_FORMATO.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? [];
