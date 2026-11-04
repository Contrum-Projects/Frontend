'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DetallePedidoCuenta,
  HistorialPedidos,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVES_PEDIDOS = {
  lista: ['pedidos', 'lista'] as const,
  detalle: (codigoPedido: string) =>
    ['pedidos', 'detalle', codigoPedido] as const,
} as const;

/** La página que sigue, o `undefined` si ya se leyeron todos los pedidos. */
export const paginaSiguiente = ({
  pagina,
  limite,
  total,
}: HistorialPedidos): number | undefined =>
  pagina * limite < total ? pagina + 1 : undefined;

/**
 * E8-H1, criterios 1 y 3 · Los pedidos de la cuenta, del más reciente al más antiguo (orden del
 * backend), de a una página. «Cargar más» pide la siguiente.
 */
export const useMisPedidos = () =>
  useInfiniteQuery({
    queryKey: CLAVES_PEDIDOS.lista,
    initialPageParam: 1,
    getNextPageParam: paginaSiguiente,
    queryFn: ({ pageParam }) =>
      conErrorDeApi(async () =>
        exigir<HistorialPedidos>(
          await api.GET('/api/pedidos', {
            params: { query: { pagina: pageParam } },
          }),
        ),
      ),
  });

/** El backend responde 404 igual si el pedido no existe o es de otra cuenta (E8-H1, criterio 4). */
export const esNoEncontrado = (error: unknown) =>
  error instanceof ErrorDeApi && error.estado === 404;

/**
 * Formato del código público del pedido, como lo valida el backend (`codigo-pedido.pipe.ts`): 12
 * letras o dígitos. Otro valor no puede existir y no se envía al backend.
 */
export const esCodigoPedido = (codigo: string) =>
  /^[A-Za-z0-9]{12}$/.test(codigo);

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/**
 * E8-H1, criterio 2 · El detalle de un pedido de la cuenta. Con un código de otro formato no se
 * consulta: la pantalla dice que el pedido no existe.
 */
export const useDetallePedido = (codigoPedido: string) =>
  useQuery({
    queryKey: CLAVES_PEDIDOS.detalle(codigoPedido),
    enabled: esCodigoPedido(codigoPedido),
    // E7-H3 · Al volver a abrir el detalle se pide de nuevo: el estado del envío puede haber cambiado
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DetallePedidoCuenta>(
          await api.GET('/api/pedidos/{codigoPedido}', {
            params: { path: { codigoPedido } },
          }),
        ),
      ),
  });

/**
 * «factura-4521.pdf» desde `Content-Disposition: attachment; filename="factura-4521.pdf"`. Solo
 * acepta un nombre simple terminado en `.pdf` (no `filename*=`); si no, usa `porDefecto`.
 */
export const nombreDeArchivo = (
  cabecera: string | null,
  porDefecto: string,
) => {
  const nombre = cabecera?.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1]?.trim();
  return nombre && /^[\w.-]+\.pdf$/i.test(nombre) ? nombre : porDefecto;
};

/** Guarda el archivo en el equipo con un enlace temporal, sin abrir otra pestaña. */
const guardarArchivo = (archivo: Blob, nombre: string) => {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  // Liberarla en el mismo instante puede cancelar la descarga en algunos navegadores
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * E9-H4, criterio 1 · Descarga el PDF de la factura del pedido. Va por `api` (con el token y por el
 * proxy), no con un enlace directo: el backend pide la sesión. Mientras la factura no se registre
 * responde 404 con su mensaje.
 */
export const useDescargarDocumento = (codigoPedido: string) =>
  useMutation({
    mutationFn: () =>
      conErrorDeApi(async () => {
        const resultado = await api.GET(
          '/api/pedidos/{codigoPedido}/documento',
          {
            params: { path: { codigoPedido } },
            parseAs: 'blob',
          },
        );
        const archivo = exigir<Blob>(resultado);
        // Solo se guarda un PDF: otra cosa es una respuesta inesperada
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
