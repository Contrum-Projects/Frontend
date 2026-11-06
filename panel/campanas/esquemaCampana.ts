import { z } from 'zod';
import type { DatosCampana } from '@/compartido/api/respuestas';

const TIPOS = ['cliente', 'profesional', 'suscriptor'] as const;

/**
 * Solo avisa antes de pedir al backend lo que falta; los largos máximos, si las categorías y marcas
 * existen y si el segmento sirve los decide el backend y su mensaje queda junto al campo.
 * El segmento tiene la forma del backend (decisión del 6 nov, SCRUM-150): tipos de destinatario y,
 * si se quiere, categorías y marcas compradas, con varias opciones en cada uno.
 */
export const esquemaCampana = z.object({
  asunto: z.string().trim().min(1, 'Escribe el asunto.'),
  cuerpo: z.string().trim().min(1, 'Escribe el mensaje.'),
  segmento: z.object({
    tipos: z.array(z.enum(TIPOS)).min(1, 'Elige a quién le llega.'),
    categorias: z.array(z.number().int()),
    marcas: z.array(z.number().int()),
  }),
}) satisfies z.ZodType<DatosCampana>;

export type FormularioCampana = z.infer<typeof esquemaCampana>;

/** Una campaña nueva parte a todos los que aceptan publicidad, sin filtro de compras. */
export const CAMPANA_VACIA: FormularioCampana = {
  asunto: '',
  cuerpo: '',
  segmento: { tipos: [...TIPOS], categorias: [], marcas: [] },
};

export type CampoCampana =
  | 'asunto'
  | 'cuerpo'
  | 'segmento.tipos'
  | 'segmento.categorias'
  | 'segmento.marcas';

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
};
