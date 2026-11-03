import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type { CobroIniciado } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

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
 * E6-H1, criterio 1 · Pide al backend el cobro del pedido en Mercado Pago
 * (`POST /api/pedidos/{codigo}/pago`). El monto lo fija el backend con el total del pedido
 * (RNF-03); aquí no se envía ninguno. Lo usan el checkout y el reintento tras un rechazo.
 */
export const pedirCobro = async (
  codigoPedido: string,
): Promise<CobroIniciado> => {
  const cobro = await conErrorDeApi(async () =>
    exigir<CobroIniciado>(
      await api.POST('/api/pedidos/{codigoPedido}/pago', {
        params: { path: { codigoPedido } },
      }),
    ),
  );
  if (!urlDePagoSegura(cobro.urlPago)) throw new ErrorDeApi(0, []);
  return cobro;
};
