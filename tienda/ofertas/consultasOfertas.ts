'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { type ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  DatosPersonales,
  MensajeApi,
  PreferenciaOfertas,
} from '@/compartido/api/respuestas';
import {
  CLAVES_CUENTA,
  conErrorDeApi,
  consultaMisDatos,
} from '@/tienda/cuenta/consultasCuenta';

/**
 * E12-H2 · Si la cuenta recibe ofertas por correo y desde cuándo. Se lee de los datos de la cuenta
 * (`consentimientoMarketing` de `GET /api/cuentas/yo`, decisión del 6 nov, SCRUM-150): la misma
 * consulta de «Mis datos», sin una ruta aparte.
 */
export const usePreferenciaOfertas = () =>
  useQuery({
    ...consultaMisDatos,
    select: (datos: DatosPersonales) => datos.consentimientoMarketing,
  });

/**
 * Activa o desactiva las ofertas. La respuesta (con la fecha que decide el backend) queda en los
 * datos de la cuenta: la pantalla no calcula la fecha del consentimiento.
 */
export const useCambiarOfertas = () => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (acepta: boolean) =>
      conErrorDeApi(async () =>
        exigir<PreferenciaOfertas>(
          await api.PUT('/api/cuentas/yo/consentimiento-marketing', {
            body: { acepta },
          }),
        ),
      ),
    onSuccess: (preferencia) => {
      clienteConsultas.setQueryData<DatosPersonales>(
        CLAVES_CUENTA.datos,
        (datos) =>
          datos ? { ...datos, consentimientoMarketing: preferencia } : datos,
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
          await api.POST('/api/marketing/bajas', { body: { token } }),
        ),
      ),
  });
