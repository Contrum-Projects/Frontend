'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { PerfilProfesionalCuenta } from '@/compartido/api/respuestas';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';
import { cuerpoPerfil, type SalidaPerfil } from './esquemaPerfil';

/**
 * Perfil profesional de la cuenta (E10-H5) en el navegador: son datos de la cuenta (RNF-30).
 * La clave lleva la cuenta, como las demás lecturas del profesional.
 */
export const CLAVE_PERFIL_PROFESIONAL = (cuenta: string) =>
  ['cuenta', 'perfil-profesional', cuenta] as const;

/**
 * El perfil, o `null` si aún no lo completa (404). Solo se pide con el rol profesional: un
 * cliente recibiría 403, y uno recién aprobado lo pide cuando su sesión se renueva.
 */
export const useMiPerfilProfesional = () => {
  const { usuario } = useSesion();
  const cuenta =
    usuario?.rol === ROLES.PROFESIONAL ? usuario.codigoPublico : '';
  return useQuery({
    queryKey: CLAVE_PERFIL_PROFESIONAL(cuenta),
    enabled: cuenta !== '',
    queryFn: () =>
      conErrorDeApi(async () => {
        const respuesta = await api.GET('/api/perfil-profesional/yo');
        if (respuesta.response.status === 404) return null;
        return exigir<PerfilProfesionalCuenta>(respuesta);
      }),
  });
};

/**
 * Guarda el perfil (PUT, lo reemplaza entero) y deja la respuesta en la caché: la pantalla lo
 * muestra y la invitación a completarlo desaparece (E10-H4).
 */
export const useGuardarPerfilProfesional = () => {
  const { usuario } = useSesion();
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: SalidaPerfil) =>
      conErrorDeApi(async () =>
        exigir<PerfilProfesionalCuenta>(
          await api.PUT('/api/perfil-profesional/yo', {
            body: cuerpoPerfil(datos),
          }),
        ),
      ),
    onSuccess: (perfil) => {
      if (!usuario) return;
      clienteConsultas.setQueryData(
        CLAVE_PERFIL_PROFESIONAL(usuario.codigoPublico),
        perfil,
      );
    },
  });
};
