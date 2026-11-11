'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { components, paths } from '@/compartido/api/esquema';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export type ClienteListado = components['schemas']['ClienteListadoDto'];
export type ListadoClientes = components['schemas']['ListadoClientesDto'];
export type ClienteDetalle = components['schemas']['ClienteDetalleDto'];
export type ConteosClientes = components['schemas']['ConteosClientesDto'];

/** Clientes y profesionales (E13-H4). Solo el administrador: el backend responde 403 al resto. */
export const CLAVE_CLIENTES = ['panel', 'clientes'] as const;

/** Filtros de la pantalla, uno a la vez, con el conteo que entrega el backend. */
export type FiltroClientes =
  'todos' | 'clientes' | 'profesionales' | 'desactivados';

export interface ConsultaClientes {
  filtro: FiltroClientes;
  buscar: string;
  pagina: number;
}

type ParametrosListado = NonNullable<
  paths['/api/clientes']['get']['parameters']['query']
>;

const PARAMETROS_FILTRO: Record<FiltroClientes, ParametrosListado> = {
  todos: {},
  clientes: { rol: 'cliente' },
  profesionales: { rol: 'profesional' },
  desactivados: { activo: false },
};

/** Listado paginado (SCRUM-154). Mientras llega la página nueva, sigue a la vista la anterior. */
export const useClientes = ({ filtro, buscar, pagina }: ConsultaClientes) =>
  useQuery({
    queryKey: [...CLAVE_CLIENTES, 'lista', { filtro, buscar, pagina }],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoClientes>(
          await api.GET('/api/clientes', {
            params: {
              query: {
                ...PARAMETROS_FILTRO[filtro],
                ...(buscar && { buscar }),
                pagina,
              },
            },
          }),
        ),
      ),
    placeholderData: keepPreviousData,
  });

export const claveCliente = (codigoPublico: string) =>
  [...CLAVE_CLIENTES, 'detalle', codigoPublico] as const;

export const useCliente = (codigoPublico: string) =>
  useQuery({
    queryKey: claveCliente(codigoPublico),
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ClienteDetalle>(
          await api.GET('/api/clientes/{codigoPublico}', {
            params: { path: { codigoPublico } },
          }),
        ),
      ),
  });

/** Tras cualquier cambio, el listado y el detalle se vuelven a pedir: muestran lo que guardó el backend. */
const useAlCambiar = () => {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: CLAVE_CLIENTES });
};

/** Desactivar (con `activa: false`) o reactivar la cuenta. Ninguna de las dos la borra. */
export const useCambiarEstadoCliente = (codigoPublico: string) => {
  const alCambiar = useAlCambiar();
  return useMutation({
    mutationFn: (activa: boolean) =>
      conErrorDeApi(async () => {
        const opciones = { params: { path: { codigoPublico } } };
        return exigir(
          activa
            ? await api.POST(
                '/api/clientes/{codigoPublico}/reactivar',
                opciones,
              )
            : await api.POST(
                '/api/clientes/{codigoPublico}/desactivar',
                opciones,
              ),
        );
      }),
    onSuccess: alCambiar,
  });
};

/**
 * Quita el rol profesional (E13-H3, `PATCH /api/cuentas/{codigoPublico}/rol`). El motivo es
 * obligatorio: el backend se lo envía por correo.
 */
export const usePasarACliente = (codigoPublico: string) => {
  const alCambiar = useAlCambiar();
  return useMutation({
    mutationFn: (motivo: string) =>
      conErrorDeApi(async () =>
        exigir(
          await api.PATCH('/api/cuentas/{codigoPublico}/rol', {
            params: { path: { codigoPublico } },
            body: { rol: 'cliente', motivo },
          }),
        ),
      ),
    onSuccess: alCambiar,
  });
};
