import { z } from 'zod';
import type { DatosCampana } from '@/compartido/api/respuestas';

const TIPOS = ['cliente', 'profesional', 'suscriptor'] as const;

/**
 * Filtros de número del segmento (`null`: sin ese filtro). Copia de backend
 * `src/modulos/marketing/segmento-campana.ts` › FILTROS_NUMERO.
 */
export const FILTROS_NUMERO = [
  'compraEnUltimosDias',
  'sinComprarHaceDias',
  'pedidosMinimo',
  'pedidosMaximo',
  'gastoMinimo',
  'gastoMaximo',
  'edadMinima',
  'edadMaxima',
  'registroUltimosDias',
  'registroHaceMasDias',
] as const;

export type FiltroNumero = (typeof FILTROS_NUMERO)[number];

/** Todos los filtros de cuenta: los que no tienen los suscriptores sin cuenta. */
export const FILTROS_CUENTA = [
  ...FILTROS_NUMERO,
  'regiones',
  'comunas',
  'mesesCumpleanos',
  'generos',
  'conCarrito',
] as const;

export type FiltroCuenta = (typeof FILTROS_CUENTA)[number];

/**
 * Solo avisa antes de pedir al backend lo que falta; los largos máximos, si las categorías y marcas
 * existen y si el segmento sirve los decide el backend y su mensaje queda junto al campo.
 * El segmento tiene la forma del backend (decisión del 6 nov, SCRUM-150): tipos de destinatario y,
 * si se quiere, categorías y marcas compradas, con varias opciones en cada uno, y los filtros de
 * cuenta del 7 nov (compras, ubicación, perfil, antigüedad y carrito).
 */
export const esquemaCampana = z.object({
  asunto: z.string().trim().min(1, 'Escribe el asunto.'),
  cuerpo: z.string().trim().min(1, 'Escribe el mensaje.'),
  segmento: z.object({
    tipos: z.array(z.enum(TIPOS)).min(1, 'Elige a quién le llega.'),
    categorias: z.array(z.number().int()),
    marcas: z.array(z.number().int()),
    // Filtros de cuenta (SCRUM-150): los rangos y si existen los revisa el backend
    ...(Object.fromEntries(
      FILTROS_NUMERO.map((clave) => [clave, z.number().int().nullable()]),
    ) as Record<FiltroNumero, z.ZodNullable<z.ZodNumber>>),
    regiones: z.array(z.string()),
    comunas: z.array(z.string()),
    mesesCumpleanos: z.array(z.number().int()),
    generos: z.array(z.string()),
    conCarrito: z.boolean(),
  }),
}) satisfies z.ZodType<DatosCampana>;

export type FormularioCampana = z.infer<typeof esquemaCampana>;

type Segmento = FormularioCampana['segmento'];

/** Sin ningún filtro de cuenta. */
export const FILTROS_VACIOS: Omit<Segmento, 'tipos' | 'categorias' | 'marcas'> =
  {
    ...(Object.fromEntries(
      FILTROS_NUMERO.map((clave) => [clave, null]),
    ) as Record<FiltroNumero, null>),
    regiones: [],
    comunas: [],
    mesesCumpleanos: [],
    generos: [],
    conCarrito: false,
  };

/** Cuántos filtros de cuenta tiene el segmento (para el contador de «Más filtros»). */
export const filtrosActivos = (segmento: Segmento): number =>
  FILTROS_CUENTA.filter((clave) => {
    const valor = segmento[clave];
    return Array.isArray(valor)
      ? valor.length > 0
      : valor !== null && valor !== false;
  }).length;

/** Una campaña nueva parte a todos los que aceptan publicidad, sin filtro de compras. */
export const CAMPANA_VACIA: FormularioCampana = {
  asunto: '',
  cuerpo: '',
  segmento: {
    tipos: [...TIPOS],
    categorias: [],
    marcas: [],
    ...FILTROS_VACIOS,
  },
};

export type CampoCampana =
  | 'asunto'
  | 'cuerpo'
  | 'segmento.tipos'
  | 'segmento.categorias'
  | 'segmento.marcas'
  | `segmento.${FiltroCuenta}`;

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * error del segmento entero (o de un campo que no está aquí) va junto a los tipos.
 */
export const CAMPOS_CAMPANA: Partial<Record<string, CampoCampana>> = {
  asunto: 'asunto',
  cuerpo: 'cuerpo',
  segmento: 'segmento.tipos',
  'segmento.tipos': 'segmento.tipos',
  'segmento.categorias': 'segmento.categorias',
  'segmento.marcas': 'segmento.marcas',
  ...Object.fromEntries(
    FILTROS_CUENTA.map((clave) => [`segmento.${clave}`, `segmento.${clave}`]),
  ),
};
