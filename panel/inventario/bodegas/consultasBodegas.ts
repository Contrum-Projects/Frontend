'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import {
  ErrorDeApi,
  errorDeApi,
  exigir,
  repartirErrores,
} from '@/compartido/api/errores';
import type {
  BodegaPanel,
  DatosBodega,
  DatosUbicacion,
} from '@/compartido/api/respuestas';
import { toast } from 'sonner';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_BODEGAS = ['panel', 'bodegas'] as const;
/** Las ubicaciones activas del inventario (entradas, ajustes, filtros) cambian con las bodegas. */
const CLAVE_UBICACIONES = ['panel', 'inventario'] as const;

const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/** Todas las bodegas, también las desactivadas, con sus ubicaciones y stock (SCRUM-151). */
export const useBodegas = () =>
  useQuery({
    queryKey: CLAVE_BODEGAS,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(await api.GET('/api/inventario/bodegas')),
      ),
  });

/** Tras guardar: la bodega que respondió el backend reemplaza a la de la lista. */
const useAlGuardar = () => {
  const clienteConsultas = useQueryClient();
  return (bodega: BodegaPanel) => {
    clienteConsultas.setQueryData<BodegaPanel[]>(CLAVE_BODEGAS, (lista) =>
      lista?.some((b) => b.id === bodega.id)
        ? lista.map((b) => (b.id === bodega.id ? bodega : b))
        : [...(lista ?? []), bodega],
    );
    return clienteConsultas.invalidateQueries({ queryKey: CLAVE_UBICACIONES });
  };
};

/** Crea (sin id) o edita la bodega; con `activa: false`, el backend exige que no tenga stock. */
export const useGuardarBodega = () => {
  const alGuardar = useAlGuardar();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number | null;
      datos: Partial<DatosBodega> & { activa?: boolean };
    }) =>
      conErrorDeApi(async () =>
        exigir(
          id
            ? await api.PATCH('/api/inventario/bodegas/{id}', {
                params: { path: { id } },
                body: datos,
              })
            : await api.POST('/api/inventario/bodegas', {
                body: datos as DatosBodega,
              }),
        ),
      ),
    onSuccess: alGuardar,
  });
};

/** Agrega (sin `ubicacionId`) o edita una ubicación de la bodega; responde la bodega entera. */
export const useGuardarUbicacion = () => {
  const alGuardar = useAlGuardar();
  return useMutation({
    mutationFn: ({
      bodegaId,
      ubicacionId,
      datos,
    }: {
      bodegaId: number;
      ubicacionId: number | null;
      datos: Partial<DatosUbicacion> & { activa?: boolean };
    }) =>
      conErrorDeApi(async () =>
        exigir(
          ubicacionId
            ? await api.PATCH(
                '/api/inventario/bodegas/{id}/ubicaciones/{ubicacionId}',
                {
                  params: { path: { id: bodegaId, ubicacionId } },
                  body: datos,
                },
              )
            : await api.POST('/api/inventario/bodegas/{id}/ubicaciones', {
                params: { path: { id: bodegaId } },
                body: datos as DatosUbicacion,
              }),
        ),
      ),
    onSuccess: alGuardar,
  });
};

/** El rechazo del backend (409 si queda stock) se muestra tal cual. */
export const avisarError = (error: Error) => toast.error(error.message);

/**
 * Un rechazo al guardar: los 400 y 409 junto a su campo (o en el aviso si no tienen campo); lo
 * demás, en el aviso. Sin conexión, fetch lanza TypeError y se muestra el mensaje genérico.
 */
export const repartirRechazo = <C extends string>(
  error: unknown,
  campos: Partial<Record<string, C>>,
  alCampo: (campo: C, mensaje: string) => void,
  alAviso: (mensaje: string) => void,
) => {
  const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
  if (fallo.estado !== 400 && fallo.estado !== 409) {
    alAviso(fallo.message);
    return;
  }
  const { porCampo, generales } = repartirErrores(fallo, campos);
  for (const [campo, mensaje] of porCampo) alCampo(campo, mensaje);
  if (generales.length > 0) alAviso(generales.join(' '));
};
