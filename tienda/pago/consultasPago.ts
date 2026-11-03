'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DetallePedidoCuenta,
  PagoConfirmado,
} from '@/compartido/api/respuestas';
import { irAUrlExterna } from '@/tienda/checkout/navegacion';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { pedirCobro } from './cobro';

/** Ids de pago de Mercado Pago: solo dígitos (como valida el backend). Sin pago llega «null». */
const FORMATO_ID_PAGO = /^\d{1,20}$/;

/**
 * El id del pago con que Mercado Pago devuelve al comprador (`payment_id`, o `collection_id` en
 * integraciones antiguas). `null` si volvió sin pagar o el valor no es un id.
 */
export const leerPagoId = (parametros: URLSearchParams): string | null => {
  const valor = parametros.get('payment_id') ?? parametros.get('collection_id');
  return valor && FORMATO_ID_PAGO.test(valor) ? valor : null;
};

/** Cómo quedó el pedido al volver de Mercado Pago. `estadoPago` es `null` si no hubo pago. */
export interface RegresoPago {
  estadoPago: PagoConfirmado['estadoPago'] | null;
  pedido: DetallePedidoCuenta;
  /**
   * El mensaje del backend si el pago no corresponde a este pedido o no es por su total (400):
   * pudo haber un cargo, así que la pantalla no dice que no lo hubo.
   */
  aviso?: string;
}

export const CLAVES_PAGO = {
  regreso: (codigoPedido: string, pagoId: string | null) =>
    ['pago', codigoPedido, pagoId] as const,
} as const;

const leerPedido = (codigoPedido: string) =>
  conErrorDeApi(async () =>
    exigir<DetallePedidoCuenta>(
      await api.GET('/api/pedidos/{codigoPedido}', {
        params: { path: { codigoPedido } },
      }),
    ),
  );

/**
 * E6-H1, criterios 2 y 3 · Al volver de Mercado Pago. Con el id del pago, el backend lo consulta
 * a Mercado Pago y lo registra (`POST …/pago/confirmar`); el resultado nunca se toma del
 * `status` de la URL. Sin id (volvió sin pagar), o si el pago no corresponde (400, con su
 * mensaje) o el pedido ya estaba pagado o cancelado (409), se lee el pedido tal como está.
 *
 * Confirmar dos veces el mismo pago no cambia nada en el backend, así que puede ir en una
 * consulta. Sin reintentos automáticos: el backend limita a 10 por minuto.
 */
export const useRegresoPago = (codigoPedido: string, pagoId: string | null) =>
  useQuery({
    queryKey: CLAVES_PAGO.regreso(codigoPedido, pagoId),
    retry: false,
    staleTime: Infinity,
    queryFn: async (): Promise<RegresoPago> => {
      if (pagoId) {
        try {
          return await conErrorDeApi(async () =>
            exigir<PagoConfirmado>(
              await api.POST('/api/pedidos/{codigoPedido}/pago/confirmar', {
                params: { path: { codigoPedido } },
                body: { pagoId },
              }),
            ),
          );
        } catch (error) {
          if (!(error instanceof ErrorDeApi)) throw error;
          if (error.estado === 400) {
            const pedido = await leerPedido(codigoPedido);
            return { estadoPago: null, pedido, aviso: error.message };
          }
          if (error.estado !== 409) throw error;
        }
      }
      return { estadoPago: null, pedido: await leerPedido(codigoPedido) };
    },
  });

/**
 * E6-H1, criterio 2 · «Intentar de nuevo»: pide otra vez el cobro del mismo pedido y lleva a Mercado Pago.
 * El backend lo permite mientras el pedido siga pendiente de pago y dentro del plazo.
 */
export const useReintentarPago = (codigoPedido: string) =>
  useMutation({
    mutationFn: () => pedirCobro(codigoPedido),
    onSuccess: (cobro) => irAUrlExterna(cobro.urlPago),
  });
