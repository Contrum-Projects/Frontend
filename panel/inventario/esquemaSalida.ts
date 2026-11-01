import { z } from 'zod';
import type { components } from '@/compartido/api/esquema';
import type { FormatoParaPack, TipoSalida } from '@/compartido/api/respuestas';

type CuerpoSalida = components['schemas']['CrearSalidaDto'];
type CuerpoAjuste = components['schemas']['CrearAjusteDto'];
type CuerpoTransferencia = components['schemas']['CrearTransferenciaDto'];

/** Lo que se muestra del formato elegido; el backend solo recibe su id. */
export type FormatoSalida = Pick<
  FormatoParaPack,
  'formatoId' | 'sku' | 'nombreFormato' | 'producto'
>;

/** Las salidas que no son venta (E11-H3) más el ajuste y la transferencia (E11-H4). */
export type TipoMovimiento = TipoSalida | 'ajuste' | 'transferencia';

/** Los tipos de movimiento, en el orden de Figma (P5c 2043:1958). */
export const TIPOS_MOVIMIENTO: {
  valor: TipoMovimiento;
  texto: string;
  boton: string;
}[] = [
  {
    valor: 'merma_vencimiento',
    texto: 'Merma por vencimiento',
    boton: 'Registrar salida',
  },
  { valor: 'merma_dano', texto: 'Merma por daño', boton: 'Registrar salida' },
  {
    valor: 'consumo_peluqueria',
    texto: 'Consumo en peluquería',
    boton: 'Registrar salida',
  },
  { valor: 'ajuste', texto: 'Ajuste', boton: 'Registrar ajuste' },
  {
    valor: 'transferencia',
    texto: 'Transferencia',
    boton: 'Registrar transferencia',
  },
];

/** El texto del botón según el tipo; sin tipo, el de la salida (como en Figma). */
export const textoBoton = (tipo: string) =>
  TIPOS_MOVIMIENTO.find(({ valor }) => valor === tipo)?.boton ??
  'Registrar salida';

/** Largo máximo del comentario o motivo (MAXIMO_* de los DTO de salida, ajuste y transferencia). */
const MAXIMO_COMENTARIO = 500;

/** Mensaje de la ubicación que falta, según el tipo. */
const FALTA_UBICACION: Partial<Record<TipoMovimiento, string>> = {
  ajuste: 'Elige la ubicación que ajustas.',
  transferencia: 'Elige la ubicación de origen.',
};

/**
 * «Registrar salida», «ajuste» o «transferencia» (E11-H3, E11-H4). Repite las reglas de
 * CrearSalidaDto, CrearAjusteDto y CrearTransferenciaDto del backend
 * (src/modulos/inventario/dto/) solo para avisar antes de enviar. Si la cantidad alcanza lo
 * decide el backend.
 */
export const esquemaSalida = z
  .object({
    tipo: z.string().min(1, 'Elige el tipo de movimiento.'),
    formato: z.custom<FormatoSalida | null>().refine((formato) => formato, {
      message: 'Elige el formato.',
    }),
    ubicacionId: z.string(),
    /** Solo en la transferencia. */
    destinoId: z.string(),
    /** Solo en el ajuste: si la cantidad suma o descuenta. */
    sentido: z.enum(['', 'sumar', 'descontar']),
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
  })
  .superRefine((datos, contexto) => {
    const falta = (path: CampoSalida, message: string) =>
      contexto.addIssue({ code: 'custom', path: [path], message });
    const tipo = datos.tipo as TipoMovimiento;

    if (!datos.ubicacionId) {
      falta(
        'ubicacionId',
        FALTA_UBICACION[tipo] ?? 'Elige la ubicación de la que sale.',
      );
    }
    if (tipo === 'transferencia' && !datos.destinoId) {
      falta('destinoId', 'Elige la ubicación de destino.');
    }
    if (tipo === 'ajuste' && !datos.sentido) {
      falta('sentido', 'Elige si sumas o descuentas.');
    }
    if (tipo === 'ajuste' && !datos.observacion) {
      falta('observacion', 'Escribe el motivo del ajuste.');
    }
  });

export type FormularioSalida = z.input<typeof esquemaSalida>;
export type DatosSalida = z.output<typeof esquemaSalida>;
export type CampoSalida = keyof FormularioSalida;

export const SALIDA_VACIA: FormularioSalida = {
  tipo: '',
  formato: null,
  ubicacionId: '',
  destinoId: '',
  sentido: '',
  cantidad: '',
  observacion: '',
};

/** El comentario vacío no se envía. */
const conObservacion = (observacion: string) =>
  observacion ? { observacion } : {};

/** Cuerpo del POST de salidas. */
export const cuerpoSalida = (datos: DatosSalida): CuerpoSalida =>
  ({
    formatoId: datos.formato!.formatoId,
    ubicacionId: Number(datos.ubicacionId),
    tipo: datos.tipo as TipoSalida,
    cantidad: Number(datos.cantidad),
    ...conObservacion(datos.observacion),
    // TODO(SCRUM-112): el Swagger tipa la observación como objeto (falta el `type`)
  }) as CuerpoSalida;

/** Cuerpo del POST de ajustes: la cantidad lleva el signo del sentido elegido. */
export const cuerpoAjuste = (datos: DatosSalida): CuerpoAjuste => ({
  formatoId: datos.formato!.formatoId,
  ubicacionId: Number(datos.ubicacionId),
  cantidad:
    datos.sentido === 'descontar'
      ? -Number(datos.cantidad)
      : Number(datos.cantidad),
  observacion: datos.observacion,
});

/** Cuerpo del POST de transferencias. */
export const cuerpoTransferencia = (datos: DatosSalida): CuerpoTransferencia =>
  ({
    formatoId: datos.formato!.formatoId,
    ubicacionOrigenId: Number(datos.ubicacionId),
    ubicacionDestinoId: Number(datos.destinoId),
    cantidad: Number(datos.cantidad),
    ...conObservacion(datos.observacion),
    // TODO(SCRUM-113): el Swagger tipa la observación como objeto (falta el `type`)
  }) as CuerpoTransferencia;

/**
 * El backend responde los errores como mensajes sin campo. Se reconocen por cómo empiezan,
 * según los DTO, comprobaciones.ts, existencias.ts y los servicios de ajustes y transferencias.
 * Los más específicos van primero.
 */
const INICIOS: [inicio: string, campo: CampoSalida][] = [
  ['El tipo de salida', 'tipo'],
  ['El formato', 'formato'],
  // «La ubicación de destino debe ser distinta de la de origen.» y sus validaciones
  ['La ubicación de destino', 'destinoId'],
  ['La ubicación', 'ubicacionId'],
  ['La cantidad', 'cantidad'],
  // «No hay stock suficiente en esa ubicación: hay 1 y la salida es de 2.»
  ['No hay stock suficiente', 'cantidad'],
  // «El stock de ese formato en esa ubicación superaría el máximo permitido.»
  ['El stock de ese formato', 'cantidad'],
  ['La observación', 'observacion'],
  ['El motivo del ajuste', 'observacion'],
];

/** El campo al que apunta un mensaje del backend, o `null` si es general. */
export const campoDelError = (
  mensaje: string,
  tipo?: string,
): CampoSalida | null => {
  // Solo el destino de una transferencia debe estar activo (transferencias.service.ts)
  if (
    tipo === 'transferencia' &&
    mensaje.startsWith('La ubicación o su bodega está desactivada')
  ) {
    return 'destinoId';
  }
  return INICIOS.find(([inicio]) => mensaje.startsWith(inicio))?.[1] ?? null;
};
