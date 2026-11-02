'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  CobroIniciado,
  CotizacionDespacho,
  DetallePedidoCuenta,
} from '@/compartido/api/respuestas';
import {
  CLAVES_CARRITO,
  useCuentaCompradora,
} from '@/tienda/carrito/consultasCarrito';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { irAUrlExterna } from './navegacion';

/**
 * Lo que el comprador eligió en el checkout: retiro, o despacho a una dirección de su cuenta
 * (E7-H1). El documento hoy es el comprobante; la factura la agrega SCRUM-125.
 */
export type EleccionCheckout = (
  { tipoEntrega: 'retiro' } | { tipoEntrega: 'despacho'; direccionId: number }
) & { tipoDocumento: 'boleta' };

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

/** Dominios desde donde Mercado Pago sirve el pago (también el de prueba, `sandbox.`). */
const DOMINIOS_PAGO = ['mercadopago.cl', 'mercadopago.com'] as const;

/**
 * Defensa en profundidad (RNF-05): solo se abre una URL de pago con https y en un dominio de
 * Mercado Pago. Cualquier otra se trata como un error y muestra el mensaje genérico.
 */
const urlDePagoSegura = (url: string): boolean => {
  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === 'https:' &&
      DOMINIOS_PAGO.some(
        (dominio) => hostname === dominio || hostname.endsWith(`.${dominio}`),
      )
    );
  } catch {
    return false;
  }
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
      const cobro = await conErrorDeApi(async () =>
        exigir<CobroIniciado>(
          await api.POST('/api/pedidos/{codigoPedido}/pago', {
            params: { path: { codigoPedido } },
          }),
        ),
      );
      if (!urlDePagoSegura(cobro.urlPago)) throw new ErrorDeApi(0, []);
      return cobro;
    },
    onSuccess: (cobro) => irAUrlExterna(cobro.urlPago),
    onError: (error) => {
      // Stock o artículos cambiaron: el carrito se vuelve a pedir para marcar qué ajustar
      if (
        !pedidoCreado &&
        error instanceof ErrorDeApi &&
        error.estado === 409
      ) {
        void clienteConsultas.invalidateQueries({
          queryKey: CLAVES_CARRITO.carrito(cuenta),
        });
      }
    },
  });
  return { ...mutacion, pedidoCreado };
};
