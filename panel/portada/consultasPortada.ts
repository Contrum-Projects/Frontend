'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import type { components } from '@/compartido/api/esquema';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import type { TipoDestino } from '@/tienda/portada/destinoPortada';

/** Slide tal como lo ve el panel: con su orden y si la tienda lo muestra (SCRUM-157). */
export type SlidePanel = components['schemas']['SlidePortadaPanelDto'];
export type OpcionDestino = components['schemas']['OpcionDestinoDto'];
export type VersionImagen = 'escritorio' | 'celular';

/** Lo que la tienda permite (`MAXIMO_SLIDES_PORTADA` y la regla de imágenes del backend). */
export const MAXIMO_SLIDES = 8;

export interface DestinoElegido {
  tipoDestino: TipoDestino;
  destino: string;
}

export const CLAVE_PORTADA = ['panel', 'portada'] as const;
const CLAVE_SLIDES = [...CLAVE_PORTADA, 'slides'] as const;

const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/** Los slides en su orden. */
export const useSlides = () =>
  useQuery({
    queryKey: CLAVE_SLIDES,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<SlidePanel[]>(await api.GET('/api/portada/slides')),
      ),
  });

/**
 * Destinos que se pueden elegir de un tipo, solo los que la tienda muestra. Mientras se escribe
 * se mantiene la lista anterior, así no parpadea.
 */
export const useOpcionesDestino = (tipo: TipoDestino, buscar: string) =>
  useQuery({
    queryKey: [...CLAVE_PORTADA, 'destinos', tipo, buscar],
    placeholderData: keepPreviousData,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<OpcionDestino[]>(
          await api.GET('/api/portada/destinos', {
            params: { query: { tipo, buscar: buscar || undefined } },
          }),
        ),
      ),
  });

/** Cada cambio responde todos los slides: se guardan tal cual en la lista. */
const useCambio = <V>(pedir: (variables: V) => Promise<SlidePanel[]>) => {
  const clienteConsultas = useQueryClient();
  return useMutation<SlidePanel[], ErrorDeApi, V>({
    mutationFn: (variables) => conErrorDeApi(() => pedir(variables)),
    onSuccess: (slides) => clienteConsultas.setQueryData(CLAVE_SLIDES, slides),
  });
};

const formulario = (campos: Record<string, string | File | undefined>) => {
  const datos = new FormData();
  for (const [campo, valor] of Object.entries(campos)) {
    if (valor !== undefined) datos.append(campo, valor);
  }
  return datos;
};

export const useCrearSlide = () =>
  useCambio(
    async ({
      escritorio,
      celular,
      destino,
    }: {
      escritorio: File;
      celular?: File;
      destino: DestinoElegido;
    }) => {
      const datos = formulario({
        tipoDestino: destino.tipoDestino,
        destino: destino.destino,
        escritorio,
        celular,
      });
      return exigir<SlidePanel[]>(
        await api.POST('/api/portada/slides', {
          body: {
            tipoDestino: destino.tipoDestino,
            destino: destino.destino,
            escritorio: '',
          },
          // openapi-fetch deja que el navegador ponga el Content-Type con su separador
          bodySerializer: () => datos,
        }),
      );
    },
  );

export const useCambiarDestino = () =>
  useCambio(async ({ id, ...destino }: DestinoElegido & { id: number }) =>
    exigir<SlidePanel[]>(
      await api.PATCH('/api/portada/slides/{id}', {
        params: { path: { id } },
        body: destino,
      }),
    ),
  );

export const useReemplazarImagen = () =>
  useCambio(
    async ({
      id,
      version,
      archivo,
    }: {
      id: number;
      version: VersionImagen;
      archivo: File;
    }) => {
      const datos = formulario({ imagen: archivo });
      const opciones = {
        params: { path: { id } },
        body: { imagen: '' },
        bodySerializer: () => datos,
      };
      return exigir<SlidePanel[]>(
        version === 'escritorio'
          ? await api.PUT(
              '/api/portada/slides/{id}/imagenes/escritorio',
              opciones,
            )
          : await api.PUT(
              '/api/portada/slides/{id}/imagenes/celular',
              opciones,
            ),
      );
    },
  );

export const useQuitarCelular = () =>
  useCambio(async (id: number) =>
    exigir<SlidePanel[]>(
      await api.DELETE('/api/portada/slides/{id}/imagenes/celular', {
        params: { path: { id } },
      }),
    ),
  );

export const useEliminarSlide = () =>
  useCambio(async (id: number) =>
    exigir<SlidePanel[]>(
      await api.DELETE('/api/portada/slides/{id}', {
        params: { path: { id } },
      }),
    ),
  );

/**
 * Guarda el orden nuevo. La lista cambia al instante (arrastrar no debe saltar) y, si el backend
 * lo rechaza, se vuelve a pedir la guardada.
 */
export const useOrdenarSlides = () => {
  const clienteConsultas = useQueryClient();
  const mutacion = useCambio(async (orden: number[]) =>
    exigir<SlidePanel[]>(
      await api.PUT('/api/portada/slides/orden', { body: { orden } }),
    ),
  );
  return {
    ...mutacion,
    ordenar: (slides: SlidePanel[], alFallar: (fallo: Error) => void) => {
      clienteConsultas.setQueryData(
        CLAVE_SLIDES,
        slides.map((slide, indice) => ({ ...slide, orden: indice + 1 })),
      );
      mutacion.mutate(
        slides.map((slide) => slide.id),
        {
          onError: (fallo) => {
            alFallar(fallo);
            return clienteConsultas.invalidateQueries({
              queryKey: CLAVE_SLIDES,
            });
          },
        },
      );
    },
  };
};
