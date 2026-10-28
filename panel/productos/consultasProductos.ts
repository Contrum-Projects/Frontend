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
  FormatoPanel,
  ImagenPanel,
  ListadoProductosPanel,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import type { CuerpoFormato } from './esquemaFormato';

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

export const claveFormatos = (productoId: number) =>
  [...CLAVE_PRODUCTOS, 'detalle', productoId, 'formatos'] as const;

/** Formatos del producto (E3-H2), con el predeterminado primero. */
export const useFormatos = (productoId: number) =>
  useQuery({
    queryKey: claveFormatos(productoId),
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<FormatoPanel[]>(
          await api.GET('/api/catalogo/productos/{id}/formatos', {
            params: { path: { id: productoId } },
          }),
        ),
      ),
  });

/**
 * Agrega (sin `formatoId`) o edita un formato. Marcar uno como predeterminado desmarca a los
 * demás, así que después se vuelve a pedir la lista entera y la del listado de productos.
 */
export const useGuardarFormato = (productoId: number) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({
      formatoId,
      cuerpo,
    }: {
      formatoId?: number;
      cuerpo: CuerpoFormato;
    }) =>
      conErrorDeApi(async () =>
        exigir<FormatoPanel>(
          formatoId === undefined
            ? await api.POST('/api/catalogo/productos/{id}/formatos', {
                params: { path: { id: productoId } },
                // TODO(SCRUM-101): el Swagger tipa los campos que admiten null como objetos
                body: cuerpo as unknown as components['schemas']['CrearFormatoDto'],
              })
            : await api.PATCH('/api/catalogo/formatos/{id}', {
                params: { path: { id: formatoId } },
                body: cuerpo as unknown as components['schemas']['ActualizarFormatoDto'],
              }),
        ),
      ),
    onSuccess: () =>
      Promise.all([
        clienteConsultas.invalidateQueries({
          queryKey: claveFormatos(productoId),
        }),
        clienteConsultas.invalidateQueries({
          queryKey: [...CLAVE_PRODUCTOS, 'lista'],
        }),
      ]),
  });
};

/**
 * Las fotos son de cada formato (E3-H3): subir, ordenar y quitar responden con todas las fotos
 * del formato, que se guardan en su lugar de la lista. Se vuelve a pedir el listado de
 * productos porque muestra la principal del formato predeterminado.
 */
const useGuardarFotos = <Variables>(
  productoId: number,
  formatoId: number,
  pedir: (variables: Variables) => Promise<ImagenPanel[]>,
) => {
  const clienteConsultas = useQueryClient();
  const guardarEnLista = (imagenes: ImagenPanel[]) =>
    clienteConsultas.setQueryData<FormatoPanel[]>(
      claveFormatos(productoId),
      (lista) =>
        lista?.map((formato) =>
          formato.id === formatoId ? { ...formato, imagenes } : formato,
        ),
    );
  return {
    guardarEnLista,
    mutacion: useMutation({
      mutationFn: (variables: Variables) =>
        conErrorDeApi(() => pedir(variables)),
      onSuccess: (imagenes) => {
        guardarEnLista(imagenes);
        return clienteConsultas.invalidateQueries({
          queryKey: [...CLAVE_PRODUCTOS, 'lista'],
        });
      },
    }),
  };
};

/** Sube una foto (JPEG, PNG o WebP; el backend revisa el tipo, el tamaño y el máximo). */
export const useSubirFoto = (productoId: number, formatoId: number) =>
  useGuardarFotos(productoId, formatoId, async (archivo: File) => {
    const datos = new FormData();
    datos.append('imagen', archivo);
    return exigir<ImagenPanel[]>(
      await api.POST('/api/catalogo/articulos/{id}/imagenes', {
        params: { path: { id: formatoId } },
        body: { imagen: '' },
        // openapi-fetch deja que el navegador ponga el Content-Type con su separador
        bodySerializer: () => datos,
      }),
    );
  }).mutacion;

/**
 * Guarda el orden y la principal. Muestra el orden nuevo al instante (arrastrar no debe
 * saltar) y, si el backend lo rechaza, vuelve a pedir las fotos guardadas.
 */
export const useOrdenarFotos = (productoId: number, formatoId: number) => {
  const clienteConsultas = useQueryClient();
  const { mutacion, guardarEnLista } = useGuardarFotos(
    productoId,
    formatoId,
    async (cuerpo: components['schemas']['OrdenarImagenesDto']) =>
      exigir<ImagenPanel[]>(
        await api.PUT('/api/catalogo/articulos/{id}/imagenes', {
          params: { path: { id: formatoId } },
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
      guardarEnLista(
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
              queryKey: claveFormatos(productoId),
            });
          },
        },
      );
    },
  };
};

/** Quita una foto. La única del formato no se puede quitar (el backend responde 409). */
export const useQuitarFoto = (productoId: number, formatoId: number) =>
  useGuardarFotos(productoId, formatoId, async (imagenId: number) =>
    exigir<ImagenPanel[]>(
      await api.DELETE('/api/catalogo/articulos/{id}/imagenes/{imagenId}', {
        params: { path: { id: formatoId, imagenId } },
      }),
    ),
  ).mutacion;
