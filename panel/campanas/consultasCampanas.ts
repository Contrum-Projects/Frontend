'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  CampanaEnviada,
  CampanaGestion,
  DatosCampana,
  ListadoCampanas,
  OpcionesSegmentoCampana,
  VistaPreviaCampana,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_CAMPANAS = ['panel', 'campanas'] as const;

type RutaCampanas =
  | '/api/gestion/campanas'
  | '/api/gestion/campanas/segmentos'
  | '/api/gestion/campanas/vista-previa'
  | '/api/gestion/campanas/{codigo}'
  | '/api/gestion/campanas/{codigo}/envio';

interface OpcionesPeticion {
  params?: { path?: { codigo: string } };
  body?: DatosCampana;
}

type Resultado = Promise<{
  data?: unknown;
  error?: unknown;
  response: Response;
}>;

/**
 * TODO(SCRUM-140): las rutas de campañas aún no están en el Swagger (API simulada, pedidas a
 * SCRUM-70). Quitar los casts cuando `pnpm api:tipos` las traiga.
 */
const pedir = api.GET as unknown as (
  ruta: RutaCampanas,
  opciones?: OpcionesPeticion,
) => Resultado;
const crear = api.POST as unknown as (
  ruta: RutaCampanas,
  opciones?: OpcionesPeticion,
) => Resultado;
const reemplazar = api.PUT as unknown as (
  ruta: RutaCampanas,
  opciones?: OpcionesPeticion,
) => Resultado;

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/** E12-H3, criterio 1 · Contactos con consentimiento y campañas, en el orden del backend. */
export const useCampanas = () =>
  useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'lista'],
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<ListadoCampanas>(await pedir('/api/gestion/campanas')),
      ),
  });

/** Lo que se puede elegir en «¿A quién le llega?»: lo define el backend. */
export const useSegmentosCampana = () =>
  useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'segmentos'],
    staleTime: 5 * 60_000,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<OpcionesSegmentoCampana>(
          await pedir('/api/gestion/campanas/segmentos'),
        ),
      ),
  });

/** Un borrador para seguir editándolo. Sin código (campaña nueva) no se pide nada. */
export const useCampana = (codigo: string | null) =>
  useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'detalle', codigo],
    enabled: codigo !== null,
    // Otra persona del personal puede haberla enviado
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<CampanaGestion>(
          await pedir('/api/gestion/campanas/{codigo}', {
            params: { path: { codigo: codigo ?? '' } },
          }),
        ),
      ),
  });

const claveVistaPrevia = (datos: DatosCampana) =>
  [...CLAVE_CAMPANAS, 'vista-previa', datos] as const;

const pedirVistaPrevia = (datos: DatosCampana) =>
  conErrorDeApi(async () =>
    exigir<VistaPreviaCampana>(
      await crear('/api/gestion/campanas/vista-previa', { body: datos }),
    ),
  );

/** Espera a que la persona deje de escribir para no pedir una vista previa por tecla. */
const useValorEstable = <T>(valor: T, espera: number): T => {
  const [estable, setEstable] = useState(valor);
  // Un objeto nuevo con el mismo contenido no reinicia la espera
  const clave = JSON.stringify(valor);
  useEffect(() => {
    const temporizador = setTimeout(
      () => setEstable(JSON.parse(clave) as T),
      espera,
    );
    return () => clearTimeout(temporizador);
  }, [clave, espera]);
  return estable;
};

export const ESPERA_VISTA_PREVIA = 400;

/**
 * E12-H3, criterio 2 · El correo como lo verá quien lo recibe (remitente y enlace de baja) y
 * cuántos destinatarios con consentimiento tiene el segmento. Lo arma el backend; mientras se
 * pide la nueva, se sigue mostrando la anterior. Con `habilitada` en falso (aún sin segmento) no
 * pide nada.
 */
export const useVistaPrevia = (datos: DatosCampana, habilitada = true) => {
  const estables = useValorEstable(datos, ESPERA_VISTA_PREVIA);
  return useQuery({
    queryKey: claveVistaPrevia(estables),
    enabled: habilitada,
    placeholderData: keepPreviousData,
    retry: reintentarSiFallaServidor,
    queryFn: () => pedirVistaPrevia(estables),
  });
};

/** La vista previa justo de estos datos (al confirmar el envío): usa la guardada si ya está. */
export const useObtenerVistaPrevia = () => {
  const clienteConsultas = useQueryClient();
  return (datos: DatosCampana) =>
    clienteConsultas.fetchQuery({
      queryKey: claveVistaPrevia(datos),
      queryFn: () => pedirVistaPrevia(datos),
    });
};

/**
 * Guarda el borrador: lo crea (POST) si aún no tiene código o lo reemplaza (PUT). Si el backend
 * rechaza, lanza `ErrorDeApi`.
 */
export const useGuardarCampana = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({
      codigo,
      datos,
    }: {
      codigo: string | null;
      datos: DatosCampana;
    }) =>
      conErrorDeApi(async () =>
        exigir<CampanaGestion>(
          codigo
            ? await reemplazar('/api/gestion/campanas/{codigo}', {
                params: { path: { codigo } },
                body: datos,
              })
            : await crear('/api/gestion/campanas', { body: datos }),
        ),
      ),
    onSuccess: (campana) => {
      clienteConsultas.setQueryData(
        [...CLAVE_CAMPANAS, 'detalle', campana.codigo],
        campana,
      );
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_CAMPANAS, 'lista'],
      });
    },
  });
};

/**
 * E12-H3, criterio 3 · Envía la campaña (sale una sola vez). El backend vuelve a revisar el
 * consentimiento de cada destinatario; si ya se envió, responde 409.
 */
export const useEnviarCampana = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (codigo: string) =>
      conErrorDeApi(async () =>
        exigir<CampanaEnviada>(
          await crear('/api/gestion/campanas/{codigo}/envio', {
            params: { path: { codigo } },
          }),
        ),
      ),
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_CAMPANAS }),
  });
};
