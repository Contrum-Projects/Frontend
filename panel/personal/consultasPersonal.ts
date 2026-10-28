'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { CuentaPersonal } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/** Cuentas del personal (E13-H1). Solo el administrador las ve: el backend responde 403 al resto. */
export const CLAVE_PERSONAL = ['panel', 'personal'] as const;

export const usePersonal = () =>
  useQuery({
    queryKey: CLAVE_PERSONAL,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<CuentaPersonal[]>(await api.GET('/api/personal')),
      ),
  });

/**
 * Desactivar no borra la cuenta: queda en la lista como desactivada. Se vuelve a pedir la lista
 * para mostrar lo que guardó el backend.
 */
export const useDesactivarCuenta = (codigoPublico: string) => {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.POST('/api/personal/{codigoPublico}/desactivar', {
            params: { path: { codigoPublico } },
          }),
        ),
      ),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: CLAVE_PERSONAL }),
  });
};

/** Envía una invitación nueva; el enlace anterior deja de servir. */
export const useReenviarInvitacion = (codigoPublico: string) =>
  useMutation({
    mutationFn: () =>
      conErrorDeApi(async () =>
        exigir(
          await api.POST('/api/personal/{codigoPublico}/invitacion', {
            params: { path: { codigoPublico } },
          }),
        ),
      ),
  });
