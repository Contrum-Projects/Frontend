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
  DatosCampana,
  GuardarSaludoCumpleanos,
  SaludoCumpleanos,
} from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

export const CLAVE_CAMPANAS = ['panel', 'campanas'] as const;

/** Solo vale la pena reintentar una falla de red o del servidor, no un 4xx. */
const reintentarSiFallaServidor = (intentos: number, error: Error) =>
  !(error instanceof ErrorDeApi && error.estado < 500) && intentos < 2;

/** Las campañas que se muestran: la página más grande que admite el backend. */
const LIMITE_LISTA = 100;

/**
 * E12-H3, criterio 1 · Contactos con consentimiento y campañas, con sus destinatarios y apertura,
 * en el orden del backend (las más nuevas primero). Todo lo cuenta el backend (SCRUM-150).
 */
export const useCampanas = () =>
  useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'lista'],
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/marketing/campanas', {
            params: { query: { limite: LIMITE_LISTA } },
          }),
        ),
      ),
  });

/** Un borrador para seguir editándolo. Sin id (campaña nueva) no se pide nada. */
export const useCampana = (id: number | null) =>
  useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'detalle', id],
    enabled: id !== null,
    // Otra persona del personal puede haberla enviado
    staleTime: 0,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.GET('/api/marketing/campanas/{id}', {
            params: { path: { id: id ?? 0 } },
          }),
        ),
      ),
  });

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

/** Lo que se ve en el correo: la vista previa en vivo no necesita el segmento. */
export interface TextoCampana {
  asunto: string;
  cuerpo: string;
}

/**
 * E12-H3, criterio 2 · El correo como lo verá quien lo recibe, armado por el backend con lo que se
 * está escribiendo (`POST /vista-previa`, decisión del 6 nov, SCRUM-150): no guarda nada, no cuenta
 * destinatarios ni sirve para enviar. Mientras se pide la nueva, se sigue mostrando la anterior.
 * Sin asunto o sin mensaje no pide nada (el backend no arma un correo vacío).
 */
export const useVistaPrevia = (
  texto: TextoCampana,
  /** El borrador guardado: con él, `{cupon}` muestra el código de su cupón (SCRUM-150). */
  campanaId: number | null = null,
) => {
  const estable = useValorEstable(
    {
      asunto: texto.asunto.trim(),
      cuerpo: texto.cuerpo.trim(),
      ...(campanaId !== null && { campanaId }),
    },
    ESPERA_VISTA_PREVIA,
  );
  return useQuery({
    queryKey: [...CLAVE_CAMPANAS, 'vista-previa', estable],
    enabled: estable.asunto !== '' && estable.cuerpo !== '',
    placeholderData: keepPreviousData,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.POST('/api/marketing/campanas/vista-previa', {
            body: estable,
          }),
        ),
      ),
  });
};

/**
 * La vista previa del borrador guardado, que cuenta los destinatarios y entrega la `confirmacion`
 * que exige el envío (vence a la hora). Siempre se pide de nuevo: es la que confirma.
 */
export const usePedirConfirmacion = () => (id: number) =>
  conErrorDeApi(async () =>
    exigir(
      await api.POST('/api/marketing/campanas/{id}/vista-previa', {
        params: { path: { id } },
      }),
    ),
  );

/**
 * Guarda el borrador: lo crea (POST) si aún no tiene id o lo edita (PATCH). Si el backend rechaza,
 * lanza `ErrorDeApi`.
 */
export const useGuardarCampana = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number | null; datos: DatosCampana }) =>
      conErrorDeApi(async () =>
        exigir(
          id
            ? await api.PATCH('/api/marketing/campanas/{id}', {
                params: { path: { id } },
                body: datos,
              })
            : await api.POST('/api/marketing/campanas', { body: datos }),
        ),
      ),
    onSuccess: (campana) => {
      clienteConsultas.setQueryData(
        [...CLAVE_CAMPANAS, 'detalle', campana.id],
        campana,
      );
      return clienteConsultas.invalidateQueries({
        queryKey: [...CLAVE_CAMPANAS, 'lista'],
      });
    },
  });
};

/**
 * E12-H3, criterio 3 · Envía la campaña (sale una sola vez) con la confirmación de su vista previa.
 * El backend vuelve a revisar el consentimiento de cada destinatario; si ya se envió, si cambió
 * después de la vista previa o esta venció, responde 409.
 */
export const useEnviarCampana = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirmacion }: { id: number; confirmacion: string }) =>
      conErrorDeApi(async () =>
        exigir(
          await api.POST('/api/marketing/campanas/{id}/envio', {
            params: { path: { id } },
            body: { confirmacion },
          }),
        ),
      ),
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_CAMPANAS }),
  });
};

const CLAVE_SALUDO = [...CLAVE_CAMPANAS, 'cumpleanos'] as const;

/** E12-H5 · Si el saludo de cumpleaños está activo, si lleva oferta y sus cifras. */
export const useSaludoCumpleanos = () =>
  useQuery({
    queryKey: CLAVE_SALUDO,
    retry: reintentarSiFallaServidor,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir(await api.GET('/api/marketing/cumpleanos')),
      ),
  });

/** El cuerpo del PUT: el saludo completo, con lo que se cambió (decisión del 6 nov, SCRUM-150). */
const cuerpoSaludo = ({
  activo,
  asunto,
  cuerpo,
  oferta,
}: SaludoCumpleanos): GuardarSaludoCumpleanos => ({
  activo,
  asunto,
  cuerpo,
  oferta: { activa: oferta.activa, texto: oferta.texto },
});

/**
 * E12-H5, criterios 1 y 2 · Activa o desactiva el saludo o su oferta. Se envía el saludo completo
 * (el PUT reemplaza todo) y la respuesta del backend queda en la caché: la tarjeta muestra lo que
 * quedó guardado, con sus cifras.
 */
export const useCambiarSaludoCumpleanos = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (pedido: SaludoCumpleanos) =>
      conErrorDeApi(async () =>
        exigir(
          await api.PUT('/api/marketing/cumpleanos', {
            body: cuerpoSaludo(pedido),
          }),
        ),
      ),
    onSuccess: (saludo) => clienteConsultas.setQueryData(CLAVE_SALUDO, saludo),
  });
};

/**
 * E12-H2 · El administrador da de baja una dirección de la publicidad cuando la persona lo pide
 * por correo: la cuenta ya no puede hacerlo sola (decisión del equipo del 11 nov, SCRUM-19). El
 * backend la apaga en la cuenta y en la suscripción sin cuenta; 404 si no hay ninguna. Los
 * contadores de contactos cambian: se vuelven a pedir.
 */
export const useDarDeBajaCorreo = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      conErrorDeApi(async () =>
        exigir(await api.POST('/api/marketing/bajas', { body: { email } })),
      ),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_CAMPANAS }),
  });
};
