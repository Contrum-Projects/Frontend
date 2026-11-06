import { z } from 'zod';
import type { CambioPermitido } from '@/compartido/api/respuestas';
import type { CuerpoCambioEstado } from './consultasPedidos';

/** `MAXIMO_COMENTARIO_ESTADO` de `cambiar-estado-pedido.dto.ts` del backend. */
const MAXIMO_COMENTARIO = 500;
/** `MAXIMO_CODIGO_SEGUIMIENTO` del mismo DTO. */
const MAXIMO_CODIGO = 15;

/**
 * «Cambiar estado» (E8-H2, criterio 2). Repite las reglas de `CambiarEstadoPedidoDto` y de
 * `cambiar-estado-pedido.service.ts` solo para avisar antes de enviar, con sus mismos mensajes.
 * Si el cambio pide comentario o código lo dice el cambio elegido, que entrega el backend.
 */
export const crearEsquemaCambioEstado = (cambios: readonly CambioPermitido[]) =>
  z
    .object({
      estado: z.string().min(1, 'Elige el estado nuevo.'),
      comentario: z
        .string()
        .trim()
        .max(
          MAXIMO_COMENTARIO,
          `El comentario no puede superar los ${MAXIMO_COMENTARIO} caracteres.`,
        ),
      codigoSeguimiento: z.string().trim(),
    })
    .superRefine((datos, contexto) => {
      const cambio = cambios.find(({ estado }) => estado === datos.estado);
      if (!cambio) return;
      if (cambio.sentido === 'retroceso' && !datos.comentario) {
        contexto.addIssue({
          code: 'custom',
          path: ['comentario'],
          message:
            'El comentario es obligatorio al volver a un estado anterior.',
        });
      }
      if (!cambio.pideCodigoSeguimiento) return;
      const codigo = datos.codigoSeguimiento;
      const mensaje = !codigo
        ? 'El código de seguimiento es obligatorio al despachar el pedido.'
        : !/^[1-9]\d*$/.test(codigo)
          ? 'El código de seguimiento debe ser un número sin ceros a la izquierda.'
          : codigo.length > MAXIMO_CODIGO
            ? `El código de seguimiento no puede superar los ${MAXIMO_CODIGO} dígitos.`
            : null;
      if (mensaje) {
        contexto.addIssue({
          code: 'custom',
          path: ['codigoSeguimiento'],
          message: mensaje,
        });
      }
    });

export type FormularioCambioEstado = z.input<
  ReturnType<typeof crearEsquemaCambioEstado>
>;
export type CampoCambioEstado = keyof FormularioCambioEstado;

/** Parte del primer avance: el paso que sigue, como en Figma. */
export const cambioInicial = (
  cambios: readonly CambioPermitido[],
): FormularioCambioEstado => ({
  estado: cambios.find(({ sentido }) => sentido === 'avance')?.estado ?? '',
  comentario: '',
  codigoSeguimiento: '',
});

/** El comentario vacío no se envía, y el código solo si el cambio lo pide. */
export const cuerpoCambioEstado = (
  datos: FormularioCambioEstado,
  cambio: CambioPermitido | undefined,
): CuerpoCambioEstado => ({
  estado: datos.estado as CuerpoCambioEstado['estado'],
  ...(datos.comentario ? { comentario: datos.comentario } : {}),
  ...(cambio?.pideCodigoSeguimiento
    ? { codigoSeguimiento: datos.codigoSeguimiento }
    : {}),
});

/**
 * A qué campo del formulario va cada campo que el backend indica en `errores` (SCRUM-150). Un
 * mensaje sin campo, o de un campo que no está aquí, se muestra como aviso general.
 */
export const CAMPOS_CAMBIO_ESTADO: Partial<Record<string, CampoCambioEstado>> =
  {
    estado: 'estado',
    comentario: 'comentario',
    codigoSeguimiento: 'codigoSeguimiento',
  };
