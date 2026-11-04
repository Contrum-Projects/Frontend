'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { type ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  MensajeApi,
  PreferenciaOfertas,
} from '@/compartido/api/respuestas';
import { useSesion } from '@/compartido/sesion/sesion';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

type RespuestaSinTipo = Promise<{
  data?: unknown;
  error?: unknown;
  response: Response;
}>;

/**
 * TODO(SCRUM-69): GET y PUT /api/cuentas/yo/ofertas y POST /api/marketing/bajas aún no están en el
 * Swagger (API simulada, forma propuesta en docs/historias/SCRUM-139.md). Quitar los casts cuando
 * `pnpm api:tipos` los traiga.
 */
const pedir = api.GET as unknown as (
  ruta: '/api/cuentas/yo/ofertas',
) => RespuestaSinTipo;
const reemplazar = api.PUT as unknown as (
  ruta: '/api/cuentas/yo/ofertas',
  opciones: { body: { activa: boolean } },
) => RespuestaSinTipo;
const enviar = api.POST as unknown as (
  ruta: '/api/marketing/bajas',
  opciones: { body: { token: string } },
) => RespuestaSinTipo;

/** Son datos de la cuenta (RNF-30): la clave lleva la cuenta. */
export const CLAVE_OFERTAS = (cuenta: string) =>
  ['cuenta', 'ofertas', cuenta] as const;

/** E12-H2 · Si la cuenta recibe ofertas por correo, desde cuándo y si su correo está verificado. */
export const usePreferenciaOfertas = () => {
  const { usuario } = useSesion();
  const cuenta = usuario?.codigoPublico ?? '';
  return useQuery({
    queryKey: CLAVE_OFERTAS(cuenta),
    enabled: cuenta !== '',
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<PreferenciaOfertas>(await pedir('/api/cuentas/yo/ofertas')),
      ),
  });
};

/**
 * Activa o desactiva las ofertas. La respuesta (con la fecha que decide el backend) queda en la
 * caché: la pantalla no calcula la fecha del consentimiento.
 */
export const useCambiarOfertas = () => {
  const { usuario } = useSesion();
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (activa: boolean) =>
      conErrorDeApi(async () =>
        exigir<PreferenciaOfertas>(
          await reemplazar('/api/cuentas/yo/ofertas', { body: { activa } }),
        ),
      ),
    onSuccess: (preferencia) => {
      if (!usuario) return;
      clienteConsultas.setQueryData(
        CLAVE_OFERTAS(usuario.codigoPublico),
        preferencia,
      );
    },
  });
};

/** E12-H2, criterio 3 · Baja con el token firmado del enlace de un correo (sin sesión). */
export const useBajaOfertas = () =>
  useMutation<MensajeApi, ErrorDeApi, string>({
    mutationFn: (token: string) =>
      conErrorDeApi(async () =>
        exigir<MensajeApi>(
          await enviar('/api/marketing/bajas', { body: { token } }),
        ),
      ),
  });
