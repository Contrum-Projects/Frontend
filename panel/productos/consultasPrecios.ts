'use client';

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { PreciosArticulo } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { CLAVE_PRODUCTOS } from './consultasProductos';
import type { CuerpoPrecios } from './esquemaPrecios';

/**
 * Precios de los formatos de un producto. Cuelgan del detalle del producto: si cambia a
 * exclusivo, se vuelven a pedir todos (E3-H5 criterio 2).
 */
export const clavePreciosProducto = (productoId: number) =>
  [...CLAVE_PRODUCTOS, 'detalle', productoId, 'precios'] as const;

const clavePrecios = (productoId: number, articuloId: number) =>
  [...clavePreciosProducto(productoId), articuloId] as const;

const pedirPrecios = (articuloId: number) =>
  conErrorDeApi(async () =>
    exigir<PreciosArticulo>(
      await api.GET('/api/catalogo/articulos/{id}/precios', {
        params: { path: { id: articuloId } },
      }),
    ),
  );

/**
 * Precios de cada formato, uno por petición (FormatoPanel no los trae; ver
 * docs/historias/SCRUM-104.md). Solo con el permiso `precios.gestionar`: sin él, el backend
 * responde 403.
 */
export const usePreciosFormatos = (
  productoId: number,
  formatoIds: number[],
  habilitado: boolean,
) =>
  useQueries({
    queries: formatoIds.map((articuloId) => ({
      queryKey: clavePrecios(productoId, articuloId),
      queryFn: () => pedirPrecios(articuloId),
      enabled: habilitado,
    })),
  });

/** Precios vigentes del formato y su historial (E3-H5). */
export const usePrecios = (productoId: number, articuloId: number) =>
  useQuery({
    queryKey: clavePrecios(productoId, articuloId),
    queryFn: () => pedirPrecios(articuloId),
  });

/**
 * Fija los precios que cambian. El backend responde con los precios y el historial, que se
 * guardan en su lugar; se vuelve a pedir el listado de productos porque muestra el precio desde.
 */
export const useFijarPrecios = (productoId: number, articuloId: number) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (cuerpo: CuerpoPrecios) =>
      conErrorDeApi(async () =>
        exigir<PreciosArticulo>(
          await api.PUT('/api/catalogo/articulos/{id}/precios', {
            params: { path: { id: articuloId } },
            body: cuerpo,
          }),
        ),
      ),
    onSuccess: (precios) => {
      clienteConsultas.setQueryData(
        clavePrecios(productoId, articuloId),
        precios,
      );
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_PRODUCTOS, 'lista'],
      });
    },
  });
};

/** Vuelve a pedir los precios del formato (p. ej. si el producto pasó a exclusivo). */
export const useRecargarPrecios = (productoId: number, articuloId: number) => {
  const clienteConsultas = useQueryClient();
  return () =>
    clienteConsultas.invalidateQueries({
      queryKey: clavePrecios(productoId, articuloId),
    });
};
