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

/** De qué detalle cuelgan los precios: el de un producto o el de un pack (E3-H6). */
export type ClavePrecios = readonly unknown[];

const clavePrecios = (base: ClavePrecios, articuloId: number) =>
  [...base, articuloId] as const;

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
      queryKey: clavePrecios(clavePreciosProducto(productoId), articuloId),
      queryFn: () => pedirPrecios(articuloId),
      enabled: habilitado,
    })),
  });

/** Precios vigentes del formato o del pack y su historial (E3-H5). */
export const usePrecios = (base: ClavePrecios, articuloId: number) =>
  useQuery({
    queryKey: clavePrecios(base, articuloId),
    queryFn: () => pedirPrecios(articuloId),
  });

/**
 * Fija los precios que cambian. El backend responde con los precios y el historial, que se
 * guardan en su lugar; se vuelve a pedir el listado de productos porque muestra el precio desde.
 */
export const useFijarPrecios = (base: ClavePrecios, articuloId: number) => {
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
      clienteConsultas.setQueryData(clavePrecios(base, articuloId), precios);
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_PRODUCTOS, 'lista'],
      });
    },
  });
};

/** Vuelve a pedir los precios (p. ej. si el producto o el pack pasó a exclusivo). */
export const useRecargarPrecios = (base: ClavePrecios, articuloId: number) => {
  const clienteConsultas = useQueryClient();
  return () =>
    clienteConsultas.invalidateQueries({
      queryKey: clavePrecios(base, articuloId),
    });
};
