'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DetalleFacturaGestion,
  FacturaRegistrada,
  ListadoFacturasGestion,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import {
  esCodigoPedido,
  guardarArchivo,
  nombreDeArchivo,
} from '@/tienda/pedidos/consultasPedidos';
import { CLAVE_PEDIDOS_PANEL } from '@/panel/pedidos/consultasPedidos';

/** Dentro de los pedidos del panel: registrar una factura también pone al día esas consultas. */
export const CLAVE_FACTURAS_PANEL = [
  ...CLAVE_PEDIDOS_PANEL,
  'facturas',
] as const;

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/**
 * E9-H3, criterio 1 · Los pedidos que pidieron factura, por emitir o con folio, en el orden del
 * backend. También da el conteo de la pestaña. Con `habilitada` en falso no pide nada.
 */
export const useFacturasPanel = (habilitada = true) =>
  useQuery({
    queryKey: [...CLAVE_FACTURAS_PANEL, 'lista'],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoFacturasGestion>(await api.GET('/api/gestion/facturas')),
      ),
    retry: reintentarSiFallaServidor,
    enabled: habilitada,
  });

/**
 * E9-H3, criterio 2 · Los datos del receptor y los montos del pedido para emitir la factura en el
 * SII. Con un código de otro formato no se consulta.
 */
export const useDetalleFactura = (codigoPedido: string) =>
  useQuery({
    queryKey: [...CLAVE_FACTURAS_PANEL, 'detalle', codigoPedido],
    enabled: esCodigoPedido(codigoPedido),
    // Otra persona del personal puede haberla registrado: se pide cada vez que se abre
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DetalleFacturaGestion>(
          await api.GET('/api/gestion/facturas/{codigoPedido}', {
            params: { path: { codigoPedido } },
          }),
        ),
      ),
  });

export interface DatosFactura {
  folio: number;
  /** AAAA-MM-DD. */
  fechaEmision: string;
  archivo: File;
}

/**
 * E9-H3, criterios 2 y 3 · Registra la factura emitida (POST /pedidos/{codigoPedido}/factura,
 * multipart con `archivo`, `folio` y `fechaEmision`). El backend copia el receptor y los montos
 * del pedido y revisa que el folio no se repita; después se vuelven a pedir la lista y el
 * detalle. Si rechaza, lanza `ErrorDeApi`.
 */
export const useRegistrarFactura = (codigoPedido: string) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ folio, fechaEmision, archivo }: DatosFactura) =>
      conErrorDeApi(async () => {
        const datos = new FormData();
        datos.append('archivo', archivo);
        datos.append('folio', String(folio));
        datos.append('fechaEmision', fechaEmision);
        return exigir<FacturaRegistrada>(
          await api.POST('/api/pedidos/{codigoPedido}/factura', {
            params: { path: { codigoPedido } },
            body: { archivo: '', folio },
            // openapi-fetch deja que el navegador ponga el Content-Type con su separador
            bodySerializer: () => datos,
          }),
        );
      }),
    // También si falla: un 409 puede decir que otra persona ya la registró
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_FACTURAS_PANEL }),
  });
};

/**
 * Descarga el PDF de una factura ya registrada (GET /pedidos/{codigoPedido}/factura, E9-H4) para
 * revisar lo que se subió. Va por `api`, con el token: el archivo es privado.
 */
export const useDescargarFacturaPanel = (codigoPedido: string) =>
  useMutation({
    mutationFn: () =>
      conErrorDeApi(async () => {
        const resultado = await api.GET('/api/pedidos/{codigoPedido}/factura', {
          params: { path: { codigoPedido } },
          parseAs: 'blob',
        });
        const archivo = exigir<Blob>(resultado);
        if (archivo.type !== 'application/pdf') throw errorDeApi(undefined);
        guardarArchivo(
          archivo,
          nombreDeArchivo(
            resultado.response.headers.get('content-disposition'),
            `factura-${codigoPedido}.pdf`,
          ),
        );
      }),
  });
