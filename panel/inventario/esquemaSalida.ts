import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { FormatoParaPack, TipoSalida } from '@/compartido/api/respuestas';

type CuerpoSalida = components['schemas']['CrearSalidaDto'];

/** Lo que se muestra del formato elegido; el backend solo recibe su id. */
export type FormatoSalida = Pick<
  FormatoParaPack,
  'formatoId' | 'sku' | 'nombreFormato' | 'producto'
>;

/** Los tipos de salida que no son venta, en el orden de Figma (P5c 2043:1958). */
export const TIPOS_SALIDA: { valor: TipoSalida; texto: string }[] = [
  { valor: 'merma_vencimiento', texto: 'Merma por vencimiento' },
  { valor: 'merma_dano', texto: 'Merma por daño' },
  { valor: 'consumo_peluqueria', texto: 'Consumo en peluquería' },
];

/** Largo máximo del comentario (MAXIMO_OBSERVACION_SALIDA de crear-salida.dto.ts). */
const MAXIMO_COMENTARIO = 500;

/**
 * «Registrar salida» (E11-H3). Repite las reglas de CrearSalidaDto del backend
 * (src/modulos/inventario/dto/crear-salida.dto.ts) solo para avisar antes de enviar. Si la
 * cantidad alcanza lo decide el backend (criterio 2).
 */
export const esquemaSalida = z.object({
  tipo: z.string().min(1, 'Elige el tipo de salida.'),
  formato: z.custom<FormatoSalida | null>().refine((formato) => formato, {
    message: 'Elige el formato que sale.',
  }),
  ubicacionId: z.string().min(1, 'Elige la ubicación de la que sale.'),
  cantidad: z
    .string()
    .trim()
    .refine(
      (valor) => /^\d+$/.test(valor) && Number(valor) >= 1,
      'La cantidad debe ser un número entero desde 1.',
    ),
  observacion: z
    .string()
    .trim()
    .max(
      MAXIMO_COMENTARIO,
      `El comentario no puede superar los ${MAXIMO_COMENTARIO} caracteres.`,
    ),
});

export type FormularioSalida = z.input<typeof esquemaSalida>;
export type DatosSalida = z.output<typeof esquemaSalida>;
export type CampoSalida = keyof FormularioSalida;

export const SALIDA_VACIA: FormularioSalida = {
  tipo: '',
  formato: null,
  ubicacionId: '',
  cantidad: '',
  observacion: '',
};

/** Cuerpo del POST. El comentario vacío no se envía. */
export const cuerpoSalida = (datos: DatosSalida): CuerpoSalida =>
  ({
    formatoId: datos.formato!.formatoId,
    ubicacionId: Number(datos.ubicacionId),
    tipo: datos.tipo as TipoSalida,
    cantidad: Number(datos.cantidad),
    ...(datos.observacion && { observacion: datos.observacion }),
    // TODO(SCRUM-112): el Swagger tipa la observación como objeto (falta el `type`)
  }) as CuerpoSalida;

/**
 * El backend responde los errores como mensajes sin campo. Se reconocen por cómo empiezan,
 * según CrearSalidaDto, comprobaciones.ts y existencias.ts.
 */
const INICIOS: [inicio: string, campo: CampoSalida][] = [
  ['El tipo de salida', 'tipo'],
  ['El formato', 'formato'],
  ['La ubicación', 'ubicacionId'],
  ['La cantidad', 'cantidad'],
  // «No hay stock suficiente en esa ubicación: hay 1 y la salida es de 2.» (criterio 2)
  ['No hay stock suficiente', 'cantidad'],
  ['La observación', 'observacion'],
];

/** El campo al que apunta un mensaje del backend, o `null` si es general. */
export const campoDelError = (mensaje: string): CampoSalida | null =>
  INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
