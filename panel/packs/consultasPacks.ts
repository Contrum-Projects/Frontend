'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { components } from '@/compartido/api/esquema';
import type {
  ImagenPanel,
  ListadoFormatosParaPack,
  ListadoPacksPanel,
  PackPanel,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_PACKS = ['panel', 'catalogo', 'packs'] as const;

export const clavePack = (id: number) =>
  [...CLAVE_PACKS, 'detalle', id] as const;

/** Precios del pack (E3-H5): cuelgan de su detalle, como los de un producto. */
export const clavePreciosPack = (id: number) =>
  [...clavePack(id), 'precios'] as const;

export const urlPack = (id: number) => `/panel/packs/${id}` as const;

/**
 * Packs ordenados por nombre, con sus componentes y si hoy están vigentes. Mientras se pide la
 * página siguiente sigue a la vista la anterior.
 */
export const usePacks = (pagina: number) =>
  useQuery({
    queryKey: [...CLAVE_PACKS, 'lista', { pagina }],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoPacksPanel>(
          await api.GET('/api/catalogo/packs', {
            params: { query: { pagina } },
          }),
        ),
      ),
    placeholderData: keepPreviousData,
  });

/** El pack con sus componentes, sus fotos y su disponibilidad (E3-H6). */
export const usePack = (id: number) =>
  useQuery({
    queryKey: clavePack(id),
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<PackPanel>(
          await api.GET('/api/catalogo/packs/{id}', {
            params: { path: { id } },
          }),
        ),
      ),
  });

/**
 * TODO(SCRUM-105): GET /catalogo/formatos aún no está en el Swagger (API simulada, pedido a
 * SCRUM-31). Quitar el cast cuando `pnpm api:tipos` lo traiga.
 */
const pedirFormatos = api.GET as unknown as (
  ruta: '/api/catalogo/formatos',
  opciones: { params: { query: { buscar?: string } } },
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

/**
 * Formatos que se pueden agregar a un pack (E3-H6 criterio 2): el backend devuelve solo formatos
 * de producto, nunca packs. Mientras se escribe sigue a la vista el resultado anterior.
 */
export const useFormatosParaPack = (buscar: string, habilitado: boolean) =>
  useQuery({
    queryKey: [...CLAVE_PACKS, 'formatos', { buscar }],
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoFormatosParaPack>(
          await pedirFormatos('/api/catalogo/formatos', {
            params: { query: buscar ? { buscar } : {} },
          }),
        ),
      ),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });

/**
 * Las fotos son del pack (su artículo de venta, E3-H6 criterio 3): subir, ordenar y quitar
 * responden con todas sus fotos, que se guardan en el detalle del pack.
 */
const useGuardarFotosPack = <Variables>(
  packId: number,
  pedir: (variables: Variables) => Promise<ImagenPanel[]>,
) => {
  const clienteConsultas = useQueryClient();
  const guardarEnPack = (imagenes: ImagenPanel[]) =>
    clienteConsultas.setQueryData<PackPanel>(clavePack(packId), (pack) =>
      pack ? { ...pack, imagenes } : pack,
    );
  return {
    guardarEnPack,
    mutacion: useMutation({
      mutationFn: (variables: Variables) =>
        conErrorDeApi(() => pedir(variables)),
      onSuccess: guardarEnPack,
    }),
  };
};

/** Sube una foto (JPEG, PNG o WebP; el backend revisa el tipo, el tamaño y el máximo). */
export const useSubirFotoPack = (packId: number) =>
  useGuardarFotosPack(packId, async (archivo: File) => {
    const datos = new FormData();
    datos.append('imagen', archivo);
    return exigir<ImagenPanel[]>(
      await api.POST('/api/catalogo/articulos/{id}/imagenes', {
        params: { path: { id: packId } },
        body: { imagen: '' },
        // openapi-fetch deja que el navegador ponga el Content-Type con su separador
        bodySerializer: () => datos,
      }),
    );
  }).mutacion;

/**
 * Guarda el orden y la principal. Muestra el orden nuevo al instante y, si el backend lo
 * rechaza, vuelve a pedir el pack.
 */
export const useOrdenarFotosPack = (packId: number) => {
  const clienteConsultas = useQueryClient();
  const { mutacion, guardarEnPack } = useGuardarFotosPack(
    packId,
    async (cuerpo: components['schemas']['OrdenarImagenesDto']) =>
      exigir<ImagenPanel[]>(
        await api.PUT('/api/catalogo/articulos/{id}/imagenes', {
          params: { path: { id: packId } },
          body: cuerpo,
        }),
      ),
  );
  return {
    ...mutacion,
    ordenar: (
      imagenes: ImagenPanel[],
      principalId: number,
      alFallar: (fallo: Error) => void,
    ) => {
      guardarEnPack(
        imagenes.map((imagen, indice) => ({
          ...imagen,
          orden: indice + 1,
          esPrincipal: imagen.id === principalId,
        })),
      );
      mutacion.mutate(
        { orden: imagenes.map((imagen) => imagen.id), principalId },
        {
          onError: (fallo) => {
            alFallar(fallo);
            return clienteConsultas.invalidateQueries({
              queryKey: clavePack(packId),
            });
          },
        },
      );
    },
  };
};

/** Quita una foto. La única del pack no se puede quitar (el backend responde 409). */
export const useQuitarFotoPack = (packId: number) =>
  useGuardarFotosPack(packId, async (imagenId: number) =>
    exigir<ImagenPanel[]>(
      await api.DELETE('/api/catalogo/articulos/{id}/imagenes/{imagenId}', {
        params: { path: { id: packId, imagenId } },
      }),
    ),
  ).mutacion;
