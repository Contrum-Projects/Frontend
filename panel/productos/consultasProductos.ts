'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  ListadoProductosPanel,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_PRODUCTOS = ['panel', 'catalogo', 'productos'] as const;

/** Filtros de Figma (P3a 2039:1063): uno a la vez. «Todos» incluye los inactivos. */
export type FiltroProductos =
  'todos' | 'exclusivos' | 'stock-bajo' | 'inactivos';

export interface ConsultaProductos {
  filtro: FiltroProductos;
  buscar: string;
  pagina: number;
}

/** Parámetros de cada filtro (la forma pedida al backend, ver respuestas.ts). */
const PARAMETROS_FILTRO: Record<FiltroProductos, Record<string, string>> = {
  todos: { incluirInactivos: 'true' },
  exclusivos: { incluirInactivos: 'true', canalVenta: 'profesional' },
  'stock-bajo': { incluirInactivos: 'true', stockBajo: 'true' },
  inactivos: { soloInactivos: 'true' },
};

/**
 * Listado del panel (E3-H1). Mientras se pide la página siguiente o se cambia el filtro, sigue
 * a la vista la anterior.
 */
export const useProductos = ({ filtro, buscar, pagina }: ConsultaProductos) =>
  useQuery({
    queryKey: [...CLAVE_PRODUCTOS, 'lista', { filtro, buscar, pagina }],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoProductosPanel>(
          await api.GET('/api/catalogo/productos', {
            params: {
              // TODO(SCRUM-100): canalVenta, stockBajo y soloInactivos aún no están en el Swagger
              query: {
                ...PARAMETROS_FILTRO[filtro],
                ...(buscar && { buscar }),
                pagina,
              } as Record<string, string | number>,
            },
          }),
        ),
      ),
    placeholderData: keepPreviousData,
  });

export const claveProducto = (id: number) =>
  [...CLAVE_PRODUCTOS, 'detalle', id] as const;

export const useProducto = (id: number) =>
  useQuery({
    queryKey: claveProducto(id),
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ProductoPanel>(
          await api.GET('/api/catalogo/productos/{id}', {
            params: { path: { id } },
          }),
        ),
      ),
  });

/**
 * Desactivar no borra el producto: deja de verse en la tienda y queda en el listado como
 * inactivo. Se guarda lo que respondió el backend y se vuelve a pedir el listado.
 */
export const useDesactivarProducto = (id: number) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: () =>
      conErrorDeApi(async () =>
        exigir<ProductoPanel>(
          await api.PATCH('/api/catalogo/productos/{id}/desactivar', {
            params: { path: { id } },
          }),
        ),
      ),
    onSuccess: (producto) => {
      clienteConsultas.setQueryData(claveProducto(id), producto);
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_PRODUCTOS, 'lista'],
      });
    },
  });
};
