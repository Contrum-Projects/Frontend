'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  CotizacionDespacho,
  DetallePedidoCuenta,
} from '@/compartido/api/respuestas';
import {
  CLAVES_CARRITO,
  useCuentaCompradora,
} from '@/tienda/carrito/consultasCarrito';
import { CLAVES_CUENTA, conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { pedirCobro } from '@/tienda/pago/cobro';
import { irAUrlExterna } from './navegacion';

/** Cómo recibe el pedido: retiro, o despacho a una dirección de su cuenta (E7-H1). */
export type EleccionEntrega =
  { tipoEntrega: 'retiro' } | { tipoEntrega: 'despacho'; direccionId: number };

/** El documento: el comprobante de pago, o factura con datos de la cuenta (E9-H1). */
export type EleccionDocumento =
  | { tipoDocumento: 'boleta' }
  | { tipoDocumento: 'factura'; datosFacturacionId: number };

/** Lo que el comprador eligió en el checkout y se envía al crear el pedido. */
export type EleccionCheckout = EleccionEntrega & EleccionDocumento;

/**
 * E7-H1, criterio 2 · El costo del despacho del carrito a una dirección de la cuenta
 * (`GET /api/despacho/cotizacion`), con IVA, y el total a pagar: los calcula el backend con
 * Chilexpress (RNF-03). Cuelga de la clave del carrito: si el carrito cambia, se vuelve a
 * cotizar. Sin reintentos automáticos: el backend limita a 10 cotizaciones por minuto.
 */
export const useCotizacionDespacho = (direccionId: number | null) => {
  const cuenta = useCuentaCompradora();
  return useQuery({
    queryKey: [...CLAVES_CARRITO.carrito(cuenta), 'despacho', direccionId],
    enabled: cuenta !== '' && direccionId !== null,
    retry: false,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<CotizacionDespacho>(
          await api.GET('/api/despacho/cotizacion', {
            params: { query: { direccionId: direccionId ?? 0 } },
          }),
        ),
      ),
  });
};

/**
 * E5-H3, criterio 2 · Crea el pedido (`POST /api/pedidos`) y pide la URL de pago
 * (`POST /api/pedidos/{codigo}/pago`) para llevar al comprador a Mercado Pago.
 *
 * La clave de idempotencia se crea una vez por visita al checkout y se repite en cada intento,
 * así que reintentar nunca crea un segundo pedido. Los montos los recalcula el backend; aquí no
 * se envía ningún precio (RNF-03).
 *
 * Al crear el pedido el backend vacía el carrito. Si después falla pedir el pago, `pedidoCreado`
 * queda con su código: la pantalla sigue mostrando el resumen que se confirmó (el carrito ya
 * vendrá vacío) y el reintento solo vuelve a pedir el pago de ese pedido.
 */
export const useConfirmarPedido = () => {
  const [claveIdempotencia] = useState(() => crypto.randomUUID());
  const [pedidoCreado, setPedidoCreado] = useState<string | null>(null);
  const cuenta = useCuentaCompradora();
  const clienteConsultas = useQueryClient();
  const mutacion = useMutation({
    mutationFn: async (eleccion: EleccionCheckout) => {
      let codigoPedido = pedidoCreado;
      if (!codigoPedido) {
        const pedido = await conErrorDeApi(async () =>
          exigir<DetallePedidoCuenta>(
            await api.POST('/api/pedidos', {
              body: { claveIdempotencia, ...eleccion },
            }),
          ),
        );
        codigoPedido = pedido.codigoPublico;
        setPedidoCreado(codigoPedido);
      }
      return pedirCobro(codigoPedido);
    },
    onSuccess: (cobro) => irAUrlExterna(cobro.urlPago),
    onError: (error) => {
      if (pedidoCreado || !(error instanceof ErrorDeApi)) return;
      // Stock o artículos cambiaron: se vuelven a pedir para marcar qué ajustar
      if (error.estado === 409) {
        void clienteConsultas.invalidateQueries({
          queryKey: CLAVES_CARRITO.carrito(cuenta),
        });
      }
      // E9-H1 · 409 si ya no quedan datos de facturación y 404 si los elegidos se desactivaron
      // (otra pestaña): la lista se vuelve a pedir y no queda elegido uno que ya no existe
      if (error.estado === 409 || error.estado === 404) {
        void clienteConsultas.invalidateQueries({
          queryKey: CLAVES_CUENTA.facturacion,
        });
      }
    },
  });
  return { ...mutacion, pedidoCreado };
};
