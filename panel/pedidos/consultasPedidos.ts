'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type { components } from '@/compartido/api/esquema';
import type {
  DetallePedidoGestion,
  ListadoPedidosGestion,
  PedidoConNuevoEstado,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { esCodigoPedido } from '@/tienda/pedidos/consultasPedidos';

/** Todo lo de pedidos del panel: un cambio de estado invalida la lista y el detalle. */
export const CLAVE_PEDIDOS_PANEL = ['panel', 'pedidos'] as const;

/** Filtros de la lista; vacíos, no se envían. */
export interface FiltrosPedidos {
  /** Clave de un grupo del backend; vacío, el grupo que el backend elige por defecto. */
  grupo: string;
  q: string;
}

/**
 * TODO(SCRUM-130): GET /gestion/pedidos y GET /gestion/pedidos/{codigoPedido} aún no están en el
 * Swagger (API simulada, pedidos a SCRUM-58). Quitar el cast cuando `pnpm api:tipos` los traiga.
 */
const pedir = api.GET as unknown as (
  ruta: '/api/gestion/pedidos' | '/api/gestion/pedidos/{codigoPedido}',
  opciones: {
    params: {
      query?: Record<string, string>;
      path?: { codigoPedido: string };
    };
  },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/** Sin los filtros vacíos. */
const consultaDe = (filtros: FiltrosPedidos) =>
  Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== ''),
  );

/**
 * E8-H2, criterio 1 · Los pedidos del grupo elegido, del más reciente al más antiguo (orden del
 * backend). Al cambiar un filtro sigue a la vista el resultado anterior. Con `habilitada` en
 * falso no pide nada.
 */
export const usePedidosPanel = (filtros: FiltrosPedidos, habilitada = true) => {
  const query = consultaDe(filtros);
  return useQuery({
    queryKey: [...CLAVE_PEDIDOS_PANEL, 'lista', query],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoPedidosGestion>(
          await pedir('/api/gestion/pedidos', { params: { query } }),
        ),
      ),
    placeholderData: keepPreviousData,
    enabled: habilitada,
  });
};

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/**
 * E8-H2, criterios 1 y 2 · El detalle del pedido con su historial y los cambios que el backend
 * permite desde su estado actual. Con un código de otro formato no se consulta.
 */
export const useDetallePedidoPanel = (codigoPedido: string) =>
  useQuery({
    queryKey: [...CLAVE_PEDIDOS_PANEL, 'detalle', codigoPedido],
    enabled: esCodigoPedido(codigoPedido),
    // Otra persona del personal puede haberlo cambiado: se pide cada vez que se abre
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<DetallePedidoGestion>(
          await pedir('/api/gestion/pedidos/{codigoPedido}', {
            params: { path: { codigoPedido } },
          }),
        ),
      ),
  });

export type CuerpoCambioEstado =
  components['schemas']['CambiarEstadoPedidoDto'];

/**
 * E8-H2, criterio 2 · Cambia el estado del pedido (POST /pedidos/{codigoPedido}/estado). El
 * backend revisa la secuencia, guarda el historial y avisa al cliente; después se vuelven a
 * pedir la lista y el detalle. Si rechaza, lanza `ErrorDeApi`.
 */
export const useCambiarEstado = (codigoPedido: string) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (cuerpo: CuerpoCambioEstado) =>
      conErrorDeApi(async () =>
        exigir<PedidoConNuevoEstado>(
          await api.POST('/api/pedidos/{codigoPedido}/estado', {
            params: { path: { codigoPedido } },
            body: cuerpo,
          }),
        ),
      ),
    // También si falla: un 409 dice que el pedido ya cambió y el detalle debe ponerse al día
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_PEDIDOS_PANEL }),
  });
};
